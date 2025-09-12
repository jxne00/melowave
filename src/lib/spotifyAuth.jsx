import { generateCodeVerifier, generateCodeChallenge } from './pkce';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

function storeAuth(obj) {
    localStorage.setItem('spotify_auth', JSON.stringify(obj));
}
function readAuth() {
    const raw = localStorage.getItem('spotify_auth');
    return raw ? JSON.parse(raw) : null;
}
export function clearAuth() {
    localStorage.removeItem('spotify_auth');
    localStorage.removeItem('pkce_code_verifier');
    localStorage.removeItem('pkce_state');
}

export async function startAuth({ scope = '' } = {}) {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateRandomState();

    localStorage.setItem('pkce_code_verifier', verifier);
    localStorage.setItem('pkce_state', state);

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        state,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope,
    });

    window.location.href = `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

function generateRandomState() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

// Exchange code for access token
export async function exchangeCodeForTokens(code) {
    const verifier = localStorage.getItem('pkce_code_verifier');

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: verifier,
    });

    const resp = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });

    if (!resp.ok) throw new Error('Token exchange failed');
    const data = await resp.json();
    const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    storeAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiresAt,
    });
    return readAuth();
}
