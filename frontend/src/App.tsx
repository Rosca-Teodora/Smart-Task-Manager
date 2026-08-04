import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import BoardList from "./views/BoardList";
import BoardDetails from "./views/BoardDetails";
import TaskDetail from "./views/TaskDetail";
import Login from "./views/Login";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./ProtectedRoute";

function Layout() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/login" replace />} />

        <Route path="login" element={<Login />} />
        <Route path="boards" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
        <Route path="boards/:boardId" element={<ProtectedRoute><BoardDetails /></ProtectedRoute>} />
        <Route path="boards/:boardId/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
