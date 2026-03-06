"use client";

import React, { useEffect, useRef, useState } from "react";
import MessageBubble, { Msg } from "./MessageBubble";
import { on } from "events";
import { IncomingMessage } from "@/hooks/useChatWebSocket";
import { useAuth } from "@/context/AuthContext";

export default function Conversation({
  messages,
  me,
  onSend,
  text,
  setText,
  contactSelected,
}: {
  messages: IncomingMessage[];
  me: number | string;
  onSend: (e: React.FormEvent<HTMLFormElement>) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  contactSelected: {
    id: any;
    username: any;
    full_name: any;
    phone_number: any;
    date_of_birth: any;
    gender: any;
    status?: string;
    avatar?: any;
  } | null;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    elRef.current?.scrollTo({
      top: elRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <section className="chat-main">
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="avatar">
            {contactSelected && contactSelected.full_name[0]}
          </div>
          <div>
            <div className="title">
              {contactSelected && contactSelected.full_name}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              last seen 5 mins ago
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button style={{ border: "none", background: "transparent" }}>
            🔍
          </button>
          <button style={{ border: "none", background: "transparent" }}>
            📞
          </button>
          <button style={{ border: "none", background: "transparent" }}>
            ⋮
          </button>
        </div>
      </div>

      <div ref={elRef} className="messages-area">
        {/* group messages by day (yyyy-mm-dd) and render groups in chronological order */}
        {(() => {
          const groups: Record<string, IncomingMessage[]> = {};
          for (const m of messages) {
            const ts = m.created_at;
            const d = new Date(Number(ts));
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
              d.getDate(),
            ).padStart(2, "0")}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(m);
          }
          const keys = Object.keys(groups).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime(),
          );
          const todayKey = (() => {
            const d = new Date();
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          })();

          return keys.map((k) => {
            const group = groups[k];
            const firstTs = group[0]?.created_at;
            const d = new Date(firstTs);
            const badge = k === todayKey ? "Today" : d.toLocaleDateString();
            return (
              <div key={k}>
                <div className="date-badge">{badge}</div>
                {group.map((m, idx) => (
                  <MessageBubble key={`${k}-${idx}`} m={m} me={me} />
                ))}
              </div>
            );
          });
        })()}
      </div>

      <form onSubmit={onSend} className="input-row">
        <input
          className="input-field"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here"
        />
        <button type="submit" className="send-btn">
          Send
        </button>
      </form>
    </section>
  );
}
