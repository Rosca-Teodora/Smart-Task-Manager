const BASE_URL = "http://127.0.0.1:8000/api";

function getToken(): string {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg1NzU4NzgxLCJpYXQiOjE3ODU3NTg0ODEsImp0aSI6IjE4ZjBiZGJkMzI5MTRhM2JiNWMyMGFmOWU4NTkwYWQyIiwidXNlcl9pZCI6IjEifQ.kM78BbsofTPZqJkE2CoWNthnDff_A-Z_LEeoh0UYIzw"; // hardcoded for now
}

async function request(path: string) { // request helper to attach auth, check status and parse json 
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
}

export type Board = {
  id: number;
  key: string;
  name: string;
};

export type Task = {
  id: number;
  key: string;
  title: string;
  description: string;
};

export type Column = {
  id: number;
  name: string;
  tasks: Task[];
};

export type BoardDetail = {
  id: number;
  name: string;
  key: string;
  columns: Column[];
};

export function getBoards(): Promise<Board[]> {
  return request("/boards/");
}

export function getBoard(id: string): Promise<BoardDetail> {
  return request("/boards/" + id + "/");
}