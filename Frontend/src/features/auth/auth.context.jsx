import { useCallback, useEffect, useState } from "react";
import { login, logout, register, getMe } from "./services/auth.api";
import { AuthContext } from "./auth.context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getMe()
            .then((data) => {
                if (active) setUser(data.user);
            })
            .catch(() => {
                if (active) setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleLogin = useCallback(async (credentials) => {
        setLoading(true);
        try {
            const data = await login(credentials);
            setUser(data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRegister = useCallback(async (details) => {
        setLoading(true);
        try {
            const data = await register(details);
            setUser(data.user);
            return data.user;
        } finally {
            setLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, handleLogin, handleRegister, handleLogout }}
        >
            {children}
        </AuthContext.Provider>
    );
};