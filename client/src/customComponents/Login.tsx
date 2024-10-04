import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSetRecoilState } from "recoil";
import { usernameState } from "@/recoil";

function Login() {
  const setUsernameState = useSetRecoilState(usernameState);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password) return;
    setLoadingBtn(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { username, password }
      );
      const token = response.data.token;
      localStorage.setItem("token", `Bearer ${token}`);
      setUsernameState(username);
      navigate("/");
    } catch (error) {
      //@ts-ignore
      console.log("error occured while logging in: ", error);
      toast({
        //@ts-ignore
        title: error.response.data.message,
      });
    }
    setLoadingBtn(false);
  };

  return (
    <>
      <div className="p-2">
        <h1 className="font-bold text-2xl border-b-2 border-black pb-2 pt-4">
          Login
        </h1>
        <div className="max-w-80 border p-4 rounded mt-5">
          <div>
            <label htmlFor="username">Username</label>
            <Input
              type="text"
              className="mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
            />
          </div>
          <div className="mt-3">
            <label htmlFor="password">Password</label>
            <Input
              type="password"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
            />
          </div>
          <Button className="mt-5" onClick={handleSubmit}>
            {loadingBtn ? "Submiting..." : "Submit"}
          </Button>
          <p className="text-blue-500 hover:text-blue-700 text-center mt-5 underline">
            Reset password
          </p>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-500 hover:text-blue-700">
              Register
            </a>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
