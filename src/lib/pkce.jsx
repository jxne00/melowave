// pkce helpers
export function generateRandomString(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(array)
        .map((x) => chars[x % chars.length])
        .join('');
}

export function generateCodeVerifier(length = 128) {
    return generateRandomString(Math.max(43, Math.min(128, length)));
}

export async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
