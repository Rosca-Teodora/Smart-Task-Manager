import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBoard, type BoardDetail } from "../Api";

function BoardDetailPage() {
  const { boardId } = useParams();
  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;
    let ignore = false;
    setLoading(true);
    getBoard(boardId)
      .then((data) => { if (!ignore) setBoard(data); })
      .catch((err) => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [boardId]);

  if (loading) return <main className="p-8">Loading…</main>;
  if (error) return <main className="p-8 text-red-600">Error: {error}</main>;
  if (!board) return null;

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">{board.key} — {board.name}</h1>
      <div className="mt-6 flex gap-4 overflow-x-auto">
        {board.columns.map((column) => (
          <div key={column.id} className="w-64 flex-shrink-0 rounded bg-gray-100 p-3">
            <h2 className="font-semibold mb-3">{column.name}</h2>
            <div className="space-y-2">
              {column.tasks.map((task) => (
                <div key={task.id} className="rounded bg-white p-3 shadow-sm">
                  <div className="text-xs text-gray-500">{task.key}</div>
                  <div className="font-medium">{task.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default BoardDetailPage;