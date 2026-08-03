import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBoards, type Board } from "../Api";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { createBoard } from "../Api";

function CreateBoardForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleCreate() {
    setError(null);
    try {
      const board = await createBoard({ name, key });
      setName("");
      setKey("");
      onCreated();
      navigate(`/boards/${board.id}`);  // jump into the new board
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  return (
    <div className="rounded border p-4 mb-4 space-y-2">
      <h3 className="font-semibold">New board</h3>
      <div className="flex gap-2">
        <input
          className="rounded border p-2 flex-1"
          placeholder="Board name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded border p-2 w-24"
          placeholder="KEY"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        <button
          className="rounded bg-blue-600 text-white px-4 disabled:opacity-50"
          onClick={handleCreate}
          disabled={!name.trim() || !key.trim()}
        >
          Create
        </button>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}



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

    function refetchBoards() {
        setLoading(true);
        getBoards()
            .then((data) => setBoards(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }

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
        <div className="mt-4">
                <CreateBoardForm onCreated={refetchBoards} />
        </div>
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
        <LogoutButton />
        </main>
    );
}

export default BoardList;