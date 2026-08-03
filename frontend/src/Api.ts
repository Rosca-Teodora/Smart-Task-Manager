const BASE_URL = "http://127.0.0.1:8000/api";

function getToken(): string | null {
  return localStorage.getItem("access");
}

export async function login(username: string, password: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error("Invalid username or password");
  }
  const data = await res.json();
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}


export function logout(): void {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("access") !== null;
}

async function request(path: string) { // request helper to attach auth, check status and parse json 
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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