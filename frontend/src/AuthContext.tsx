import { createContext, useContext, useState, type ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, isLoggedIn } from "./Api";

type AuthContextType = {
    authenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(isLoggedIn());

    async function login(username: string, password: string) {
        await apiLogin(username, password);
        setAuthenticated(true);
    }

    function logout() {
        apiLogout();
        setAuthenticated(false);
    }

    return (
        <AuthContext.Provider value={{ authenticated, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}