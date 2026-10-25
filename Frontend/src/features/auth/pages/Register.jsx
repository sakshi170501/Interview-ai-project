import { useState } from 'react'
import { useNavigate,Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import "../aut.form.scss"


const Register = () => {
  const navigate=useNavigate()
  const [username,setUsername]=useState("")
  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")
  const {loading,handleRegister}=useAuth()

   const handleSubmit=async(e)=>{
    e.preventDefault()
    setError("")
    try {
      await handleRegister({username,email,password})
      navigate("/")
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Please try again.")
    }
  }
  if(loading){
    return(<main><h1>Loading....</h1></main>)
  }
  return (
    <main>
      
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
            <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e)=>{setUsername(e.target.value)}}
              type="text"
              minLength={2}
              maxLength={40}
              required
              id="username"
              name="username"
              placeholder="Enter the correct username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
             onChange={(e)=>{setEmail(e.target.value)}}
              type="email"
              required
              id="email"
              name="email"
              placeholder="Enter the correct email address"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
             onChange={(e)=>{setPassword(e.target.value)}}
              type="password"
              id="password"
              name="password"
              minLength={8}
              maxLength={72}
              required
              placeholder="Enter the correct Password"
            />
          </div>
          {error && <p role="alert">{error}</p>}
          <button className="button primary-button" disabled={loading}>REGISTER</button>
        </form>

        <p>Alraedy have an account?<Link to='/login'>Login</Link></p>
      </div>
    </main>
  )
}

export default Register
