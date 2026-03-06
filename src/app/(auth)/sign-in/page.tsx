"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function SignIn() {
  const { signIn, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await signIn(username.trim(), password);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      setLocalError(err?.detail ?? "Failed to sign in");
    }
  };

  const onGoogle = () => {
    // placeholder for OAuth flow
    alert("Google sign-in not wired in demo");
  };

  return (
    <div className="sign-card">
      <header className="card-header">
        <div className="logo">💬</div>
        <h2 className="title">Welcome back</h2>
        <p className="subtitle">Sign in to continue your conversations</p>
      </header>

      <div className="card-body">
        <button className="btn google" onClick={onGoogle} type="button">
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="divider">Or continue with email</div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span className="label">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              placeholder="Enter your username"
              required
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="footer-cta">
          <span>Don't have an account?</span>
          <a href="/sign-up">Sign up</a>
        </div>

        {(localError || error) && (
          <div className="error">{localError ?? error}</div>
        )}
      </div>
    </div>
  );
}
