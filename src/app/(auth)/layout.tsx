"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import "./AuthLayout.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="auth-layout">{children}</div>
    </AuthProvider>
  );
}
