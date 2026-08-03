import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
        await login(username, password);
        navigate("/boards");
        } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed");
        }
    }

    return (
        <main className="p-8 max-w-sm mx-auto">
        <h1 className="text-2xl font-bold mb-4">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
            <input
            className="w-full rounded border p-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
            <input
            className="w-full rounded border p-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button className="w-full rounded bg-blue-600 text-white p-2" type="submit">
            Log in
            </button>
        </form>
        </main>
    );
}

export default Login;