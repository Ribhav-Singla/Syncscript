import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

function Login() {
  return (
    <>
      <div className="p-2">
        <h1 className="font-bold text-2xl border-b-2 border-black pb-2 pt-4">
          Login
        </h1>
        <div className="max-w-80 border p-4 rounded mt-5">
          <div>
            <label htmlFor="username">Username</label>
            <Input type="text" className="mt-1" />
          </div>
          <div className="mt-3">
            <label htmlFor="password">Password</label>
            <Input type="password" className="mt-1" />
          </div>
          <Button className="mt-5">Submit</Button>
          <p className="text-blue-500 hover:text-blue-700 text-center mt-5 underline">Reset password</p>
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
