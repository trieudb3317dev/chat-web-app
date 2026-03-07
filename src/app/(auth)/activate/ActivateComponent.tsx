"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { activateUser } from "@/apis/client";

export default function ActivateComponent({ token }: { token: string | null }) {
  const router = useRouter();

  const onActivate = useCallback(() => {
    if (!token) return;
    activateUser({ token })
      .then(() => {
        router.push("/sign-in");
      })
      .catch((err) => console.error("activateUser failed", err));
  }, [token, router]);

  return (
    <div style={{ padding: 20 }} className="activate-card">
      <h1 className="activate-title">Activate Your Account</h1>
      <button className="activate-button" onClick={onActivate} disabled={!token}>
        Activate User
      </button>
    </div>
  );
}
