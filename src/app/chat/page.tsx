"use client";

import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./chat.css";
import Sidebar from "./components/Sidebar";
import SettingsModal from "./components/SettingsModal";
import Conversation from "./components/Conversation";
import { useAuth } from "@/context/AuthContext";
import { getFriendsList } from "@/apis/client";

export default function ChatPage({ userId }: { userId: number }) {
  const { user } = useAuth();
  const wsId = user?.id ?? userId ?? undefined;
  const url = wsId ? `ws://localhost:8000/ws/${wsId}` : undefined;
  // messages state is provided by the websocket hook (includes history updates)
  const [text, setText] = useState("");
  const [activeChatWith, setActiveChatWith] = useState<number | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [contactSelected, setContactSelected] = useState<{
    id: any;
    username: any;
    full_name: any;
    phone_number: any;
    date_of_birth: any;
    gender: any;
    avatar?: any;
    status?: string;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      const friendsList = await getFriendsList();
      setFriends(friendsList.friends);
      console.log("Fetched friends:", friendsList.friends);
    };
    fetchFriends();
  }, []);

  let contacts = useMemo(() => {
    // map friends to contacts shape expected by Sidebar
    return friends.map((f) => ({
      id: f.id,
      username: f.username,
      full_name: f.full_name,
      phone_number: f.phone_number,
      date_of_birth: f.date_of_birth,
      gender: f.gender,
      status: "online", // could be dynamic based on real presence info
      avatar: f.avatar ?? "",
    }));
  }, [friends]);

  const onMessage = useCallback((msg: any) => {
    // keep an event log for debugging; actual message storage is handled inside the hook
    setLog((l) => [`<- ${JSON.stringify(msg)}`, ...l].slice(0, 200));
  }, []);

  const {
    historyMeta,
    loadMore,
    sendMessage,
    joinChat,
    leaveChat,
    status,
    messages: wsMessages,
    clearMessages,
    markSeen,
    unreadCounts,
  } = useChatWebSocket({
    url,
    onMessage,
    onOpen: () => setLog((l) => ["connected", ...l]),
  });

  useEffect(() => {
    if (activeChatWith != null) {
      console.log("Joining chat with", activeChatWith);
      joinChat(activeChatWith);
    } else {
      console.log("Leaving chat");
      leaveChat();
    }
  }, [activeChatWith, joinChat, leaveChat]);

  // messages for active chat (use messages provided by the WS hook)
  const convoMessages = useMemo(() => {
    if (activeChatWith == null) return [];
    return wsMessages;
  }, [wsMessages, activeChatWith]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || activeChatWith == null) return;
    // send via websocket; server will emit history/new message back which the hook will append
    sendMessage(activeChatWith, text.trim());
    setText("");
    setLog((l) => [`-> ${text.trim()}`, ...l].slice(0, 200));
  };

  return (
    <div className="chat-container">
      <Sidebar
        contacts={contacts}
        selected={activeChatWith}
        onSelect={(id) => {
          setActiveChatWith(Number(id));
          try {
            markSeen(Number(id));
          } catch (e) {
            // ignore
          }
        }}
        unreadCounts={unreadCounts}
        setContactSelected={setContactSelected}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {settingsOpen && <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChatWith != null ? (
          <Conversation
            messages={convoMessages}
            me={userId}
            text={text}
            setText={setText}
            onSend={(e: React.FormEvent) => handleSend(e)}
            contactSelected={contactSelected}
          />
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6b7280",
            }}
          >
            Select a chat to start
          </div>
        )}
      </div>
    </div>
  );
}
