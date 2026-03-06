"use client";

import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function Sidebar({
  contacts,
  selected,
  onSelect,
  unreadCounts,
  setContactSelected,
}: {
  contacts: {
    id: number;
    username: string;
    full_name: string;
    phone_number: string;
    date_of_birth: string;
    gender: string;
    avatar?: string;
    status?: string;
  }[];
  selected: number | string | null;
  onSelect: (id: number | string) => void;
  unreadCounts?: Record<string, number>;
  setContactSelected: React.Dispatch<
    React.SetStateAction<{
      id: any;
      username: any;
      full_name: any;
      phone_number: any;
      date_of_birth: any;
      gender: any;
      avatar?: any;
      status?: string;
    } | null>
  >;
}) {
  const { signOut } = useAuth();
  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <div className="header-left">
          <button className="menu-btn" aria-label="menu">
            ☰
          </button>
          <strong className="sidebar-title">Messages</strong>
        </div>
        <div className="new-badge">New</div>
      </div>

      <input className="search-input" placeholder="Search Conversations" />

      <div className="contacts-list">
        {contacts.map((c) => (
          <div
            key={c.id}
            className={`contact-item ${String(selected) === String(c.id) ? "active" : ""}`}
            onClick={() => {
              onSelect(c.id);
              setContactSelected(c);
            }}
          >
            <div className="contact-main">
              <div className="avatar" style={{ position: "relative" }}>
                {c.avatar ? (
                  <img src={c.avatar} alt={c.full_name} />
                ) : (
                  <div className="avatar-fallback">{c.full_name[0]}</div>
                )}
                {c.status === "online" && <span className="online-dot" />}
              </div>
              <div className="contact-meta">
                <div className="contact-name">{c.full_name}</div>
                <div className="contact-last">No messages yet</div>
              </div>
            </div>
            <div className="contact-right">
              <div className="timestamp"></div>
              {Boolean(
                unreadCounts && Number(unreadCounts[String(c.id)] ?? 0) > 0,
              ) ? (
                <div className="unread-badge">
                  {unreadCounts && unreadCounts[String(c.id)]}
                </div>
              ) : (
                <div style={{ width: 12 }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar_settings">
        <button className="settings-btn">⚙️ Settings</button>
        <button className="settings-btn" onClick={signOut}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
