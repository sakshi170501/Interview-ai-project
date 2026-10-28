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
      setError(
        requestError.response?.data?.message ||
        (requestError.response?.status === 404
          ? "The registration service is unavailable on this deployment. Please try again later."
          : "Unable to create your account. Please try again.")
      )
    }
  }
  if(loading){
    return(<main className="auth-page"><p className="auth-loading" role="status">Loading your account…</p></main>)
  }
  return (
    <main className="auth-page">
      <div className="auth-layout">
        <Link className="auth-brand" to="/" aria-label="Interview AI home">
          <span className="auth-brand__mark" aria-hidden="true">I</span>
          <span>Interview<span className="auth-brand__accent">AI</span></span>
        </Link>

        <section className="form-container" aria-labelledby="auth-title">
          <div className="auth-heading">
            <h1 id="auth-title">Create your account</h1>
            <p>Get a personalized interview plan tailored to your next opportunity.</p>
          </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              minLength={2}
              maxLength={40}
              required
              autoComplete="username"
              id="username"
              name="username"
              placeholder="Choose a username"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
              id="email"
              name="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              maxLength={72}
              required
              autoComplete="new-password"
              id="password"
              name="password"
              placeholder="Create a password"
            />
          </div>
          {error && <p role="alert">{error}</p>}
          <button className="button primary-button" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  )
}

export default Register
