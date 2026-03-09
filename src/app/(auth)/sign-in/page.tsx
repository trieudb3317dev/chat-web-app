"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/apis/client";

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
    // Ask backend to build the Google OAuth URL (backend may include PKCE state).
    (async () => {
      try {
        const data = await api.getGoogleLoginUrl();
        const url = data?.url || data?.auth_url || data?.redirect || null;
        if (!url) throw new Error("No url from backend");

        // Open a popup and wait for the backend+frontend callback to postMessage back
        const w = window.open(url, "google_oauth", "width=520,height=700");
        const handle = (e: MessageEvent) => {
          // accept messages from our origin only
          if (e.origin !== window.location.origin) return;
          if (e.data?.type === "oauth" && e.data?.status) {
            window.removeEventListener("message", handle);
            if (w) w.close();
            // refresh auth state (AuthContext should handle fetching /me)
            window.location.reload();
          }
        };
        window.addEventListener("message", handle);
      } catch (err) {
        console.error("Failed to start Google login", err);
        alert("Failed to start Google login");
      }
    })();
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
