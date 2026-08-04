# minijira

A small kanban issue tracker: boards with columns, tasks that carry a project key
(`ENG-14`), priorities, assignees and comments. Django REST Framework on the back,
React + TypeScript on the front, with an optional local LLM that turns a rough
sentence into a drafted ticket.

---

## Setup

### Requirements

- Python 3.12+
- Node 20+
- [Ollama](https://ollama.com) — optional, only needed for the AI task drafter

### Backend

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` (see `backend/.env_example`):

```
SECRET_KEY='some-long-random-string'
DEBUG='TRUE'
```

Then migrate and run:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser    # optional, for /admin
python manage.py runserver
```

The API is served at `http://127.0.0.1:8000/api/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The API base URL is hardcoded to
`http://127.0.0.1:8000/api` in `src/Api.ts`; the backend's `CORS_ALLOWED_ORIGINS`
only permits port 5173, so if Vite picks a different port you have to update both.

### AI drafting (optional)

The "draft a task" feature calls a local Ollama instance — nothing is sent to a
third-party API.

```bash
ollama pull llama3.2
ollama serve
```

Without it the app works normally; the draft endpoint returns 503 and the UI shows
"AI service unavailable".

### Useful commands

| Command | Where | What |
| --- | --- | --- |
| `npm run build` | `frontend/` | Typecheck (`tsc -b`) and production build |
| `npm run lint` | `frontend/` | oxlint |
| `python manage.py makemigrations` | `backend/` | After changing models |

---

## Architecture

```
minijira/
├── backend/
│   ├── config/          settings, root urls, wsgi/asgi
│   └── boards/          the single Django app: models, serializers,
│                        views, permissions, ai.py
└── frontend/
    └── src/
        ├── Api.ts       every network call + all shared types
        ├── AuthContext  auth state, current user
        ├── views/       one file per route
        └── components/  shared UI (NavBar, avatars, chips, tags)
```

### Backend

A REST API with **no server-rendered templates** — Django serves JSON only, and the
React app is a separate origin.

**Data model** (`boards/models.py`)

```
Board ──< UserBoard >── User          membership + role ("owner" / anything else)
  │
  ├──< Column                          ordered by `position`
  │
  └──< Task ──< Comment
         │  └──< AssignedTask >── User
         └──< Task (self FK: subtasks)
```

Details worth knowing:

- **Task numbering.** `Task.save()` takes a `select_for_update()` lock and computes
  `max(number) + 1` *scoped to the board*, inside a transaction, so two boards both
  start at 1 and concurrent creates can't collide. A `UniqueConstraint` on
  `(board, number)` backs it up.
- **Subtasks** use an adjacency list (`main_task` self-FK). `clean()` enforces a
  single level — a subtask cannot own subtasks.
- **`Column` is `PROTECT`ed** on delete, so a column holding tasks can't be dropped
  silently. Everything else cascades from the board.
- Uniqueness is enforced at the DB level: one membership per user per board, one
  assignment per user per task.

**Request pipeline.** ModelViewSets + a `DefaultRouter`. Authentication is JWT
(SimpleJWT) with `IsAuthenticated` as the project-wide default.

Authorization runs in three layers, because DRF alone doesn't cover all of them:

1. **Queryset scoping** — every viewset overrides `get_queryset()` to filter through
   the membership table (`board__userboard__user=request.user`). This is what makes
   other people's boards invisible rather than merely forbidden.
2. **Object permissions** (`boards/permissions.py`) — run on detail routes.
   `CommentPermission` and `AssignmentPermission` allow reads to any member, writes
   to the author/assignee themselves, and anything to a board `owner`.
3. **`perform_create` checks** — object permissions never fire on `POST`, so create
   rules (are you a member of this board? are you allowed to assign *someone else*?)
   are enforced in the view.

Note that setting `permission_classes` on a viewset **replaces** the default rather
than adding to it, so each custom permission class defines its own `has_permission`
to keep the authentication check.

**Serializers** swap by action via `get_serializer_class()`: list endpoints return a
flat shape, `retrieve` returns a nested one (`BoardDetailSerializer` embeds members
and columns and their tasks; `TaskDetailSerializer` embeds comments and assignees).
This keeps the board view to a single request instead of an N+1 waterfall.

**AI drafting** (`boards/ai.py`) is a POST to a local Ollama server with
`format: "json"` to constrain the output. The result is re-validated in Python —
priority is coerced into the allowed set, a missing title raises — so a hallucinating
model can't write junk into the database. Failures map to distinct HTTP codes: 503
unreachable, 422 unusable output, 400 empty input.

### Frontend

React 19 + TypeScript, Vite, React Router 7, Tailwind v4.

- **`Api.ts` is the only module that talks to the network.** It also owns every
  shared type, so a backend field rename surfaces as a typecheck error in the views.
- **Token refresh is transparent.** Access tokens are short-lived; both the read
  helper (`request`) and the write helpers (`mutate`, `post`) retry once after
  silently refreshing. If the refresh token is also dead, storage is cleared and the
  user lands back on login.
- **`AuthContext`** holds `authenticated` plus the current user (fetched from
  `/api/me/`). The username is needed to decide which edit/delete buttons to show,
  and the JWT payload only carries `user_id`.
- **`ProtectedRoute`** wraps the board routes; `/` redirects to `/login`.
- **Tailwind v4 with a design token layer.** `index.css` defines semantic tokens
  (`canvas`, `surface`, `ink`, `accent`, `danger`, plus radius and type scales) in
  `@theme`, and component classes (`.btn`, `.input`) in `@layer components`. Views
  use the tokens, not raw palette values, so the whole app re-themes from one file.

**UI permissions mirror the backend, they don't replace it.** Buttons are hidden
when the action would fail, but every rule is enforced server-side; a 403 that slips
through still renders as an inline error.

---

## Features

**Accounts**
- Register, log in, log out. JWT access/refresh in `localStorage`, refreshed
  transparently mid-session.
- Protected routes redirect to login; the nav bar reflects auth state and the active
  page.

**Boards**
- Create, rename, and delete boards. Each has a short key (`ENG`) used in task IDs.
- You only ever see boards you belong to. Creating one makes you its owner.
- Members shown as overlapping avatar circles, name and role on hover/focus.

**Columns**
- Create, rename, delete. Ordered by position. Deleting a column that still holds
  tasks is refused rather than cascading.

**Tasks**
- Create, edit (title, description, column, priority), delete.
- Board-scoped sequential keys — `ENG-1`, `ENG-2`.
- Three priority levels with colour-coded tags.
- Board view groups tasks into columns with per-column counts; cards show key,
  priority and assignee avatars.
- Detail view pairs the description against a metadata rail — the description
  scrolls internally so the two panels always line up.

**Assignment**
- Assign and unassign members on the task detail page.
- Any member can assign or unassign themselves; only an owner can assign or remove
  someone else. Non-members can't be assigned at all.
- Assignees appear as chips on the task and as an avatar stack on board cards.

**Comments**
- Post, edit and delete comments, with author and timestamp; edited comments are
  marked as such.
- Edit/delete controls only surface for the comment's author or a board owner.

**AI task drafting**
- Type a rough sentence, get a drafted title, description and priority back from a
  local model, editable before saving.

**Throughout**
- Skeleton loaders, empty states, and inline error messages — no `window.alert`.
- Inline confirmation strips for destructive actions instead of browser dialogs.
- Keyboard-focusable controls with visible focus rings; screen-reader labels on
  icon-only buttons.

---

## Known limitations

- No test suite (`boards/tests.py` is the stub).
- No pagination on any list endpoint.
- `UserBoardViewSet` has no queryset scoping or permission class, so membership rows
  are not protected the way the other resources are — an authenticated user can add
  themselves to any board. Fixing this is the next security item.
- No drag-and-drop; tasks move between columns through the edit form.
- Subtasks exist in the data model but have no UI.
- SQLite and `DEBUG` are development settings; `ALLOWED_HOSTS` is empty and the API
  URL is hardcoded, so this isn't deployment-ready as-is.
