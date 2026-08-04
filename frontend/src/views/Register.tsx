import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { register } from "../Api";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { authenticated, login } = useAuth();
    const navigate = useNavigate();

    if (authenticated) {
        return <Navigate to="/boards" replace />;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await register(username.trim(), password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Register failed");
            setSubmitting(false);
            return;
        } 
        try {
            await login(username.trim(), password);
            navigate("/boards");
        }
        catch {
            navigate("/login", {state: { message: "Account created succesfuly"}});
        }

    }

    return (
        <main className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-5xl place-content-center items-center gap-x-14 gap-y-10 px-6 py-16 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
            <section className="max-w-lg">
                <h1 className="text-title font-semibold tracking-[-0.03em] text-balance text-ink lg:text-display lg:leading-[1.05]">
                    Every task in one place.
                </h1>
                <p className="mt-4 max-w-[46ch] text-body leading-relaxed text-ink-muted">
                    Create an account and start your first board.
                </p>
            </section>

            <section className="w-full rounded-panel border border-line bg-surface p-6 shadow-[0_20px_50px_-30px_rgba(28,24,21,0.45)]">
                <h2 className="text-label font-semibold tracking-[-0.01em] text-ink">Create an account</h2>

                <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
                    <label className="flex flex-col gap-1">
                        <span className="text-meta font-medium text-ink-muted">Username</span>
                        <input
                            className="input"
                            autoComplete="username"
                            autoFocus
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>

                    <label className="flex flex-col gap-1">
                        <span className="text-meta font-medium text-ink-muted">Password</span>
                        <input
                            className="input"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>

                    {error && (
                        <p
                            className="rounded-control bg-danger-soft px-2.5 py-2 text-meta text-danger"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        className="btn btn-lg btn-primary mt-1 w-full"
                        type="submit"
                        disabled={submitting || !username.trim() || !password}
                    >
                        {submitting ? "Signing up…" : "Sign up"}
                    </button>
                </form>

                <p className="mt-5 border-t border-line pt-4 text-center text-label text-ink-muted">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="rounded-control font-medium text-accent underline-offset-2 transition duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                        Sign in
                    </Link>
                </p>
            </section>
        </main>
    );
}

export default Register;
