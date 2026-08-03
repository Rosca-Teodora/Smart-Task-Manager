import { Route, Routes } from "react-router-dom";
import BoardList from "./views/BoardList";
import BoardDetails from "./views/BoardDetails";
import TaskDetail from "./views/TaskDetail";
import Home from "./views/Home";
import Login from "./views/Login";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route index element={<Home/>} />

      <Route path="login" element={<Login />} />
      <Route path="boards" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
      <Route path="boards/:boardId" element={<ProtectedRoute><BoardDetails /></ProtectedRoute>} />
      <Route path="boards/:boardId/tasks/:taskId" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;

