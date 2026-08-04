import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { login as apiLogin, logout as apiLogout, isLoggedIn, getMe, type CurrentUser } from "./Api";

type AuthContextType = {
    authenticated: boolean;
    user: CurrentUser | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authenticated, setAuthenticated] = useState(isLoggedIn());
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        if (!authenticated) {
            setUser(null);
            return;
        }
        let ignore = false;
        getMe()
            .then((me) => { if (!ignore) setUser(me); })
            .catch(() => { if (!ignore) setUser(null); });
        return () => { ignore = true; };
    }, [authenticated]);

    async function login(username: string, password: string) {
        await apiLogin(username, password);
        setAuthenticated(true);
    }

    function logout() {
        apiLogout();
        setAuthenticated(false);
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ authenticated, user, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
