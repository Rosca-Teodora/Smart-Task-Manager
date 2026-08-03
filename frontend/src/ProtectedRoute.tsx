import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { authenticated } = useAuth();
    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

export default ProtectedRoute;