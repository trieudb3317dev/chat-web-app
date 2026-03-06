import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import React, { useCallback, useEffect, useState } from "react";

interface ChatMessage {
  id?: number;
  chat_id: number;
  from: number;
  content: string;
  ts?: number;
}

export function ChatWindow({ userId }: { userId: number }) {
  const url = `ws://localhost:8000/ws/${userId}`;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const [activeChatWith, setActiveChatWith] = useState<number | null>(null);

  const onMessage = useCallback((msg: any) => {
    setLog((l) => [`<- ${JSON.stringify(msg)}`, ...l].slice(0, 200));
    if (msg.type === "new_message") {
      setMessages((m) => [
        ...m,
        { chat_id: msg.chat_id, from: msg.from, content: msg.text, ts: msg.ts },
      ]);
    } else if (msg.type === "message_seen") {
      setLog((l) => [`<- seen ${JSON.stringify(msg)}`, ...l].slice(0, 200));
    } else if (msg.type === "unread_count") {
      setLog((l) => [`<- unread_count ${msg.count}`, ...l].slice(0, 200));
    }
  }, []);

  const { sendMessage, joinChat, leaveChat, status } = useChatWebSocket({
    url,
    onMessage,
    onOpen: () => setLog((l) => ["connected", ...l]),
  });

  useEffect(() => {
    if (activeChatWith != null) {
      joinChat(activeChatWith);
    } else {
      leaveChat();
    }
  }, [activeChatWith, joinChat, leaveChat]);

  const handleSend = () => {
    if (!text.trim() || activeChatWith == null) return;
    sendMessage(activeChatWith, text.trim());
    setMessages((m) => [
      ...m,
      { chat_id: -1, from: userId, content: text.trim(), ts: Date.now() },
    ]);
    setText("");
    setLog((l) => [`-> ${text.trim()}`, ...l].slice(0, 200));
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ width: 420 }}>
        <h3>
          Chat (user {userId}) - status: {status}
        </h3>
        <div style={{ marginBottom: 8 }}>
          <label>Active chat with user id: </label>
          <input
            type="number"
            value={activeChatWith ?? ""}
            onChange={(e) =>
              setActiveChatWith(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            height: 300,
            overflow: "auto",
            padding: 8,
          }}
        >
          {messages.map((m, i) => (
            <div key={i}>
              <b>{m.from}</b>: {m.content}{" "}
              <small>{m.ts ? new Date(m.ts).toLocaleTimeString() : ""}</small>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: 300 }}
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>

      <div style={{ width: 420 }}>
        <h4>Wire log</h4>
        <div
          style={{
            height: 380,
            overflow: "auto",
            border: "1px solid #eee",
            padding: 8,
          }}
        >
          {log.map((l, i) => (
            <div key={i} style={{ fontFamily: "monospace", fontSize: 12 }}>
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
