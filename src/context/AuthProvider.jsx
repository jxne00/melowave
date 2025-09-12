import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { startAuth, exchangeCodeForTokens, clearAuth } from '../lib/spotifyAuth';

// component that provides auth state to children, wraps around app
export function AuthProvider({ children }) {
    const [accessToken, setAccessToken] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (code) {
            exchangeCodeForTokens(code)
                .then((auth) => setAccessToken(auth.access_token))
                .catch((err) => console.error(err))
                .finally(() => {
                    const url = new URL(window.location.href);
                    url.search = '';
                    window.history.replaceState({}, '', url.toString());
                    setReady(true);
                });
        } else {
            setReady(true);
        }
    }, []);

    const login = (opts) => startAuth(opts);
    const logout = () => {
        clearAuth();
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{ accessToken, ready, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
