import Homepage from "./customComponents/Homepage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./customComponents/Login";
import Register from "./customComponents/Register";
import Documents from "./customComponents/Documents";
import Navbar from "./customComponents/Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documents/:id" element={<Documents />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
