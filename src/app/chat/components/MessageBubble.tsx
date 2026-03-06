"use client";

import { useAuth } from "@/context/AuthContext";
import { IncomingMessage } from "@/hooks/useChatWebSocket";
import React, { use } from "react";

export type Msg = {
  id?: string | number;
  from: number | string;
  text: string;
  ts?: number | string;
};

export default function MessageBubble({
  m,
  me,
}: {
  m: IncomingMessage;
  me: number | string;
}) {
  const { user } = useAuth();
  const mine = m.user_from_id === user?.id;

  return (
    <div className={`message-row ${mine ? "mine" : "other"}`}>
      <div className={`message-bubble ${mine ? "mine" : "other"}`}>
        <div className="message-text">{m.text}</div>
        {m.created_at && (
          <div className="message-time">
            {new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        )}
      </div>
    </div>
  );
}
