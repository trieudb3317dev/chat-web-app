"use client";

import React, { useEffect, useRef, useState } from "react";
import MessageBubble, { Msg } from "./MessageBubble";
import { on } from "events";
import { IncomingMessage } from "@/hooks/useChatWebSocket";
import { useAuth } from "@/context/AuthContext";
import { removeFriend, sendChatImage } from "@/apis/client";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

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
            {contactSelected &&
              (contactSelected.full_name || contactSelected.username || "?")[0]}
          </div>
          <div>
            <div className="title">
              {contactSelected &&
                (contactSelected.full_name || contactSelected.username || "?")}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              last seen 5 mins ago
            </div>
          </div>
        </div>
        <div className="chat-actions" style={{ position: "relative" }}>
          <button style={{ border: "none", background: "transparent" }}>
            🔍
          </button>
          <button style={{ border: "none", background: "transparent" }}>
            📞
          </button>
          <button
            style={{
              border: "none",
              background: "transparent",
              color: "#111827",
            }}
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            ⋮
          </button>

          {menuOpen && (
            <div
              className="conversation-menu"
              style={{
                position: "absolute",
                right: 0,
                top: 36,
                background: "white",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                borderRadius: 6,
                zIndex: 40,
              }}
            >
              <button
                className="menu-item"
                onClick={() => {
                  setShowInfo(true);
                  setMenuOpen(false);
                }}
                style={{
                  display: "block",
                  padding: "8px 12px",
                  width: 200,
                  textAlign: "left",
                  color: "#111827",
                }}
              >
                View info
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  fileRef.current?.click();
                  setMenuOpen(false);
                }}
                style={{
                  display: "block",
                  padding: "8px 12px",
                  width: 200,
                  textAlign: "left",
                  color: "#111827",
                }}
              >
                Send image
              </button>
              <button
                className="menu-item"
                onClick={async () => {
                  if (!contactSelected) return;
                  if (
                    !confirm(
                      `Remove friend ${contactSelected.full_name || contactSelected.username}?`,
                    )
                  )
                    return;
                  try {
                    setRemoving(true);
                    await removeFriend({ friend_id: contactSelected.id });
                    // After removal, you might want to navigate away or notify parent — here we just close menu and show info
                  } catch (err) {
                    console.error("Failed to remove friend", err);
                  } finally {
                    setRemoving(false);
                  }
                }}
                style={{
                  display: "block",
                  padding: "8px 12px",
                  width: 200,
                  textAlign: "left",
                  color: "#b91c1c",
                }}
              >
                {removing ? "Removing..." : "Remove friend"}
              </button>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !contactSelected) return;
            try {
              setUploading(true);
              const res = await sendChatImage({
                chat_with_id: contactSelected.id,
                file,
              });
              // Optionally append returned message to messages list via parent callback or websocket
              console.log("send image response", res);
            } catch (err) {
              console.error("Failed to send image", err);
            } finally {
              setUploading(false);
              if (fileRef.current) fileRef.current.value = "";
            }
          }}
        />
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

      {showInfo && contactSelected && (
        <div
          className="info-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
          onClick={() => setShowInfo(false)}
        >
          <div
            className="info-modal"
            style={{
              background: "white",
              borderRadius: 8,
              padding: 20,
              minWidth: 320,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                className="avatar"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {
                  (contactSelected.full_name ||
                    contactSelected.username ||
                    "?")[0]
                }
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#111827" }}>
                  {contactSelected.full_name || contactSelected.username}
                </div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {contactSelected.username}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: "#374151" }}>
                Phone: {contactSelected.phone_number ?? "-"}
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>
                DOB: {contactSelected.date_of_birth ?? "-"}
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>
                Gender: {contactSelected.gender ?? "-"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 16,
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowInfo(false)}
                style={{ padding: "8px 12px" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
