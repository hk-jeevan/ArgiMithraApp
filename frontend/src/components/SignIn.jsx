import React, { useState } from "react";
import "./SignIn.css";

const API_URL = "http://127.0.0.1:8000";

export default function SignIn({ onCancel, onConfirm }) {
  const [mode, setMode] = useState("signin"); // signin | register
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url =
      mode === "register"
        ? `${API_URL}/auth/signup`
        : `${API_URL}/auth/login`;

    const payload =
      mode === "register"
        ? { name, email: identifier, password }
        : { email: identifier, password };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errRes = await res.json().catch(() => ({}));
        throw new Error(errRes.detail || "Failed. Try again!");
      }

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }

      onConfirm(identifier); // Notify parent
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signin-backdrop">
      <div className="signin-modal">
        <h3>{mode === "signin" ? "Login" : "Register"}</h3>

        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            placeholder="Email"
            value={identifier}
            type="email"
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}

          <div className="actions">
            <button type="button" onClick={onCancel} className="secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : mode === "signin"
                ? "Login"
                : "Create Account"}
            </button>
          </div>
        </form>

        <div className="switch-mode">
          {mode === "signin" ? (
            <small>
              Don’t have an account?{" "}
              <button onClick={() => setMode("register")}>Register</button>
            </small>
          ) : (
            <small>
              Already registered?{" "}
              <button onClick={() => setMode("signin")}>Login</button>
            </small>
          )}
        </div>
      </div>
    </div>
  );
}
