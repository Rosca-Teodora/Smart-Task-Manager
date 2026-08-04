const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

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

export async function register(username: string, password: string): Promise<Response> {
    const res = await fetch(`${BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password}),
    });
    if (!res.ok) {
        throw new Error("Could not register account");
    }
    return res;
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






// POST helper that retries once after a token refresh, so callers can keep
// their own status handling instead of going through mutate()
async function post(path: string, body: unknown): Promise<Response> {
    const send = () => {
        const token = getToken();
        return fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
        });
    };

    const res = await send();
    if (res.status === 401 && await refreshAccessToken()) {
        return send();
    }
    return res;
}

export async function draftTask(input: string): Promise<DraftResult>{
    const res = await post("/tasks/draft/", {input});
    if (res.status === 503)
        throw new Error("AI service unavailable");
    if (!res.ok)
        throw new Error("Couldn't draft a task from input");
    return res.json();
}

export async function createTask(task:CreateTaskInput): Promise<void> {
    const res = await post("/tasks/", task);
    if (!res.ok)
        throw new Error(`Could not create task: ${res.status}`);
}

export async function createBoard(board: { name: string; key: string }): Promise<Board> {
    const res = await post("/boards/", board);
    if (!res.ok) throw new Error(`Could not create board: ${res.status}`);
    return res.json();
}

export async function createColumn(column: { board: number; name: string; position: number }): Promise<void> {
    const res = await post("/columns/", column);
    if (!res.ok) throw new Error(`Could not create column: ${res.status}`);
}

export async function createComment(comment: CreateCommentInput): Promise<void>{
    const res = await post("/comments/", comment);
    if (!res.ok) throw new Error(`Could not post comment: ${res.status}`);
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
    assignees: Assignment[];
};

export type Column = {
    id: number;
    name: string;
    tasks: Task[];
};

export type BoardMember = {
    id: number;
    username: string;
    role: string;
}

export type CurrentUser = {
    id: number;
    username: string;
}

export type BoardDetail = {
    id: number;
    name: string;
    key: string;
    members: BoardMember[];
    columns: Column[];
};

export type CreateCommentInput = {
    task: number;
    text: string;
};

export type Comment = {
    id: number;
    text: string;
    task: number;
    author: string;
    created_date: string;
    last_edited_date: string;
}

export type TaskDetail = {
    id: number;
    key: string;
    title: string;
    description: string;
    comments: Comment[]
    assignees: Assignment[];
    created_date: string;
    last_edited_date: string;
    status: number;
    board: number;
    priority: Priority;
};

export type Assignment = {
    id: number;
    task: number;
    user: number;
    username: string;
};


// get functions
export function getBoards(): Promise<Board[]> {
    return request("/boards/");
}

export function getBoard(id: string): Promise<BoardDetail> {
    return request("/boards/" + id + "/");
}

export function getTask(id: string): Promise<TaskDetail> {
    return request("/tasks/" + id + "/");
}

export function getComments(taskId: number): Promise<Comment[]> {
    return request(`/comments/?task=${taskId}`);
}

export function getMe(): Promise<CurrentUser> {
    return request("/me/");
}

export function getAssignments(taskId: number): Promise<Assignment[]> {
    return request(`/assignments/?task=${taskId}`);
}

// helper to handle both delete and patch (both post requests)
async function mutate(path: string, method: string, body?: unknown) {
  const send = () => {
    const token = getToken();
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  let res = await send();

  if (res.status === 401) { // token expired
    const isRefreshed = await refreshAccessToken();
    if (isRefreshed) res = await send();
  }

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

export async function deleteComment(id: number): Promise<void> {
    await mutate(`/comments/${id}/`, "DELETE");
}

export async function deleteAssignment(id: number): Promise<void> {
    await mutate(`/assignments/${id}/`, "DELETE");
}

export async function createAssignment(taskId: number, userId: number): Promise<Assignment> {
    return mutate("/assignments/", "POST", { task: taskId, user: userId });
}


// EDITS (patch only)
export async function updateBoard(id: number, data: { name?: string; key?: string }): Promise<void> {
  await mutate(`/boards/${id}/`, "PATCH", data);
}

export async function updateColumn(id: number, data: { name?: string }): Promise<void> {
  await mutate(`/columns/${id}/`, "PATCH", data);
}

export async function updateTask(id: number, data: { title?: string; description?: string; status?: number; priority?: Priority }): Promise<void> {
  await mutate(`/tasks/${id}/`, "PATCH", data);
}

export async function updateComment(id: number, data: { text: string }): Promise<Comment> {
    return mutate(`/comments/${id}/`, "PATCH", data);
}