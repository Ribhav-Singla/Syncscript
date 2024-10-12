import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { usernameState } from "@/recoil";

function ResetPassword() {

  const setUsernameState = useSetRecoilState(usernameState);
  const navigate = useNavigate()
  const { toast } = useToast()
  const [username,setUsername] = useState('')
  const [password,setPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [loadingBtn,setLoadingBtn] = useState(false)

  const handleSubmit = async()=>{
    if(!username && !password && !confirmPassword) return;
    else if(password != confirmPassword){
      console.log('invalid');
      toast({
        title:'Password didnt match'
      })
      return;
    }else{
      setLoadingBtn(true)
      try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/resetPassword`,{ username, password})
        const token = response.data.token
        localStorage.setItem('token',`Bearer ${token}`)
        setUsernameState(username)
        navigate('/')
        toast({
            title:'Password reset successfully',
        })
      } catch (error) {
        //@ts-ignore
        console.log('error occured while registering: ',error);
        toast({
          //@ts-ignore
          title: error.response.data.message
        })
      }
      setLoadingBtn(false)
    }
  }

  return (
    <>
      <div className="p-2">
        <h1 className="font-bold text-2xl border-b-2 border-black pb-2 pt-4">
          Reset Password
        </h1>
        <div className="max-w-80 border p-4 rounded mt-5">
          <div>
            <label htmlFor="username">Username</label>
            <Input type="text" className="mt-1" value={username} onChange={(e) => setUsername(e.target.value.trim())} />
          </div>
          <div className="mt-3">
            <label htmlFor="password">New Password</label>
            <Input type="password" className="mt-1" value={password} onChange={(e)=> setPassword(e.target.value.trim())} />
          </div>
          <div className="mt-3">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input type="password" className="mt-1" value={confirmPassword} onChange={(e)=> setConfirmPassword(e.target.value.trim())} />
          </div>
          <Button className="mt-5" onClick={handleSubmit}>{ loadingBtn ? 'Submiting...' : 'Submit'}</Button>
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

export default ResetPassword