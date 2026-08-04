import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function NavBar() {
    const { authenticated, logout } = useAuth();
    const navigate = useNavigate();
    const onLoginPage = useLocation().pathname === "/login";

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <nav className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-8">
                <Link
                    to={authenticated ? "/boards" : "/login"}
                    className="rounded-control text-body font-semibold tracking-[-0.02em] text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                    mini<span className="text-accent">jira</span>
                </Link>

                {authenticated && (
                    <NavLink
                        to="/boards"
                        className={({ isActive }) =>
                            `btn btn-sm ${isActive ? "bg-accent-soft text-accent" : "btn-ghost"}`
                        }
                    >
                        My boards
                    </NavLink>
                )}

                <div className="ml-auto">
                    {authenticated ? (
                        <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
                            Log out
                        </button>
                    ) : (
                        !onLoginPage && (
                            <Link to="/login" className="btn btn-sm btn-primary">
                                Log in
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

export default NavBar;
