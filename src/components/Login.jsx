import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import "./Auth.css";

function Login({ onToggle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">We're so excited to see you again!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleEmailLogin} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>

        <div className="divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-button" disabled={loading}>
          <span className="google-icon">G</span> Continue with Google
        </button>

        <div className="auth-footer">
          Need an account?{" "}
          <span className="auth-link" onClick={onToggle}>
            Register
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
