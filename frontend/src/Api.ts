
// import { useState, useEffect } from "react";

// type Board = {
//   id: number;
//   key: string;
//   name: string;
// };
// const [boards, setBoards] = useState<Board[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const token = "momentan token copiat si hardcodat manual pentru testare";
//     fetch("http://127.0.0.1:8000/api/boards/", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error(`API returned ${res.status}`);
//         return res.json();
//       })
//       .then((data) => setBoards(data))
//       .catch((err) => setError(err.message))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <main className="p-8">Loading…</main>;
//   if (error) return <main className="p-8 text-red-600">Error: {error}</main>;

//   return (
//     <main className="p-8">
//       <h1 className="text-2xl font-bold">Mini Jira</h1>
//       <ul className="mt-4 space-y-2">
//         {boards.map((board) => (
//           <li key={board.id} className="rounded border p-3">
//             {board.key} — {board.name}
//           </li>
//         ))}
//       </ul>
//     </main>
//   );