import Homepage from "./customComponents/Homepage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./customComponents/Login";
import Register from "./customComponents/Register";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
