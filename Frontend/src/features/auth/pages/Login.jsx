
import { useState } from "react";

import "../aut.form.scss";

import { Link } from "react-router";

import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router";

const Login = () => {
  const { loading, handleLogin } = useAuth();
  const navigate=useNavigate()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await handleLogin({ email, password });
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to log in. Please check your details and try again.");
    }
  };

  if (loading) {
    return (
      <main className="auth-page">
        <p className="auth-loading" role="status">Loading your account…</p>
      </main>
    );
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
            <h1 id="auth-title">Welcome back</h1>
            <p>Sign in to continue to your interview plans.</p>
          </div>

          <form onSubmit={handleSubmit}>
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
                required
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="Enter your password"
              />
            </div>

            {error && <p role="alert">{error}</p>}
            <button className="button primary-button" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New to InterviewAI? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
