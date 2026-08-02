import { Route, Routes } from "react-router-dom";
import BoardList from "./views/BoardList";
import BoardDetails from "./views/BoardDetails";
import Home from "./views/Home";

function App() {
  return (
    <Routes>
      <Route index element={<Home/>} />

      <Route path="boards" element={<BoardList/>} />
      <Route path="boards/:boardId" element={< BoardDetails/>} />
    </Routes>
  );
}

export default App;

