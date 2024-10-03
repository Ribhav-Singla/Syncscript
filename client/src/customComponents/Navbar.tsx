import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
  return (
    <nav className="navbar flex justify-between items-center p-2 border-b-2">
      <div>
        <span className="text-2xl cursor-pointer font-bold" onClick={()=>navigate('/')}>Syncscript</span>
      </div>
      <div className="flex justify-center items-center gap-5">
        <Button onClick={()=>navigate('/login')}>Login</Button>
        <Button onClick={()=>navigate('/register')}>Register</Button>
        <Button onClick={()=>navigate('/')}>Logout</Button>
      </div>
    </nav>
  );
}

export default Navbar;
