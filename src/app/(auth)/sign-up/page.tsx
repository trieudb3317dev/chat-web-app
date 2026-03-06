"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const { signUp, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.push("/activate");
    } catch (err: any) {
      setLocalError(err?.detail ?? "Failed to sign up");
    }
  };

  const onGoogle = () => {
    alert("Google sign-up not wired in demo");
  };

  return (
    <div className="sign-card wide">
      <header className="card-header">
        <div className="logo">💬</div>
        <h2 className="title">Create your account</h2>
        <p className="subtitle">Start your journey with ChatFlow today</p>
      </header>

      <div className="card-body">
        <button className="btn google" onClick={onGoogle} type="button">
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <div className="divider">Or register with email</div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="field">
            <span className="label">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="John Doe"
              required
            />
          </label>

          <label className="field">
            <span className="label">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span className="label">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Create a password"
              required
            />
          </label>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="footer-cta">
          <span>Already have an account?</span>
          <a href="/sign-in">Sign in</a>
        </div>

        {(localError || error) && (
          <div className="error">{localError ?? error}</div>
        )}
      </div>
    </div>
  );
}
