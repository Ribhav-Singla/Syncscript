import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usernameState, myDocumentsState } from "@/recoil";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect } from "react";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useRecoilState(usernameState);
  const setMyDocumentsState =useSetRecoilState(myDocumentsState)

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
          {
            headers: {
              Authorization: `${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.data.username) {
          setUsername(response.data.username)
        }
      } catch (error) {
        console.log("error occured in the usernameState: ", error);
      }
    };
    fetchUsername()
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUsername("");
    setMyDocumentsState([])
    navigate("/");
  };

  return (
    <nav className="navbar flex justify-between items-center p-2 border-b-2 bg-slate-100">
      <div>
        <span
          className="text-2xl cursor-pointer font-bold"
          onClick={() => navigate("/")}
        >
          Syncscript
        </span>
      </div>
      <div className="flex justify-center items-center gap-5">
        {username ? (
          <div className="flex justify-center items-center gap-5">
            <Button onClick={handleLogout}>Logout</Button>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>
                {username.toUpperCase()[0] + username.toUpperCase()[1]}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex justify-center items-center gap-5">
            <Button onClick={() => navigate("/login")}>Login</Button>
            <Button onClick={() => navigate("/register")}>Register</Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
