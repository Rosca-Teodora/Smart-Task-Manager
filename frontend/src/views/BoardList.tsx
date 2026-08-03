import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBoards, type Board } from "../Api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return (
        <button
        onClick={() => { logout(); navigate("/login"); }}
        className="text-sm text-gray-600 underline"
        >
        Log out
        </button>
    );
}


function BoardList() {
    const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;
        getBoards()
        .then((data) => { if (!ignore) setBoards(data); })
        .catch((err) => { if (!ignore) setError(err.message); })
        .finally(() => { if (!ignore) setLoading(false); });
        return () => { ignore = true; };
    }, []);

    if (loading) return <main className="p-8">Loading…</main>;
    if (error) return <main className="p-8 text-red-600">Error: {error}</main>;

    return (
        <main className="p-8">
        <h1 className="text-2xl font-bold">Your Boards</h1>
        <ul className="mt-4 space-y-2">
            {boards.map((board) => (
            <li key={board.id}>
                <Link
                to={`/boards/${board.id}`}
                className="block rounded border p-3 hover:bg-gray-50"
                >
                {board.key} — {board.name}
                </Link>
            </li>
            ))}
        </ul>
        <LogoutButton></LogoutButton>
        </main>
    );
}

export default BoardList;