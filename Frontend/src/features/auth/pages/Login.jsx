
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
      <main>
        <h1>Loading..</h1>
      </main>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>

            <input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              required
              id="password"
              name="password"
              placeholder="Enter the correct Password"
            />
          </div>

          {error && <p role="alert">{error}</p>}
          <button className="button primary-button" disabled={loading}>
            LOGIN
          </button>
        </form>

        <p>
          Don't have an account?
          <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
