"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status") || "ok";
    // notify opener (popup) or navigate
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          { type: "oauth", status },
          window.location.origin,
        );
      } catch (e) {
        // ignore
      }
      window.close();
    } else {
      // fallback: navigate main window
      router.push("/");
    }
  }, [router]);

  return <div>Signing in... You can close this window.</div>;
}
