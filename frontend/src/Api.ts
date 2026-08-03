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



async function refreshAccessToken(): Promise<boolean> {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;

    const res = await fetch(`${BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
        // refresh itself expired/invalid — user must log in again
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        return false;
    }

    const data = await res.json();
    localStorage.setItem("access", data.access);
    return true;
}


async function request(path: string) { // request helper to attach auth, check status and parse json 
    let token = getToken();
    let res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.status === 401) { // token expired
    const isRefreshed = await refreshAccessToken();
    if (isRefreshed) {
        token = getToken();
        res = await fetch(`${BASE_URL}${path}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }
  }

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }
  return res.json();
}






export async function draftTask(input: string): Promise<DraftResult>{
    const token = getToken();
    const res = await fetch(`${BASE_URL}/tasks/draft/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify({input}),
    });
    if (res.status === 503)
        throw new Error("AI service unavailable");
    if (!res.ok)
        throw new Error("Couldn't draft a task from input");
    return res.json();
}

export async function createTask(task:CreateTaskInput): Promise<void> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/tasks/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify(task),
    })
    if (!res.ok)
        throw new Error(`Could not create task: ${res.status}`);
}

export async function createBoard(board: { name: string; key: string }): Promise<Board> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/boards/`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(board),
    });
    if (!res.ok) throw new Error(`Could not create board: ${res.status}`);
    return res.json();
}

export async function createColumn(column: { board: number; name: string; position: number }): Promise<void> {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/columns/`, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(column),
    });
    if (!res.ok) throw new Error(`Could not create column: ${res.status}`);
}

export type Priority = "LOW" | "MED" | "HIGH";

export type DraftResult = {
    title: string;
    description: string;
    priority: Priority;
}

export type CreateTaskInput = {
    board: number;
    status: number;
    title: string;
    description: string;
    position: number;
    priority?: Priority;
};

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
    priority: Priority;
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

export type TaskDetail = {
    id: number;
    key: string;
    title: string;
    description: string;
    created_date: string;
    last_edited_date: string;
    status: number;
    board: number;
    priority: Priority;
};

export function getBoards(): Promise<Board[]> {
    return request("/boards/");
}

export function getBoard(id: string): Promise<BoardDetail> {
    return request("/boards/" + id + "/");
}

export function getTask(id: string): Promise<TaskDetail> {
    return request("/tasks/" + id + "/");
}

async function mutate(path: string, method: string, body?: unknown) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
  return res.status === 204 ? null : res.json();
}

// DELETES
export async function deleteBoard(id: number): Promise<void> {
  await mutate(`/boards/${id}/`, "DELETE");
}
export async function deleteColumn(id: number): Promise<void> {
  await mutate(`/columns/${id}/`, "DELETE");
}
export async function deleteTask(id: number): Promise<void> {
  await mutate(`/tasks/${id}/`, "DELETE");
}

// EDITS (PATCH — partial update, only send changed fields)
export async function updateBoard(id: number, data: { name?: string; key?: string }): Promise<void> {
  await mutate(`/boards/${id}/`, "PATCH", data);
}
export async function updateColumn(id: number, data: { name?: string }): Promise<void> {
  await mutate(`/columns/${id}/`, "PATCH", data);
}
export async function updateTask(id: number, data: { title?: string; description?: string; status?: number }): Promise<void> {
  await mutate(`/tasks/${id}/`, "PATCH", data);
}