import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Navbar from "./Navbar";

function Register() {
  return (
    <>
      <Navbar />
      <div className="p-2">
        <h1 className="font-bold text-2xl border-b-2 border-black pb-2 pt-4">
          Register
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
          <div className="mt-3">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input type="password" className="mt-1" />
          </div>
          <Button className="mt-5">Submit</Button>
        </div>
        <div className="mt-3">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:text-blue-700">
              Login
            </a>
          </p>
        </div>
      </div>
    </>
  )
}

export default Register