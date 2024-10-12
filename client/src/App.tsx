import Homepage from "./customComponents/Homepage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./customComponents/Login";
import Register from "./customComponents/Register";
import Documents from "./customComponents/Documents";
import Navbar from "./customComponents/Navbar";
import { Toaster } from "@/components/ui/toaster"
import ResetPassword from "./customComponents/ResetPassword";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/documents/:id" element={<Documents />} />
        </Routes>
        <Toaster/>
      </BrowserRouter>
    </>
  );
}

export default App;
