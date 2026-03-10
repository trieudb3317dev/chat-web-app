"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useState } from "react";
import { getUnfriendedList, addFriend, getFriendRequests } from "@/apis/client";
import Notifications from "./Notifications";

export default function Sidebar({
  contacts,
  selected,
  onSelect,
  unreadCounts,
  setContactSelected,
  onOpenSettings,
  onRefreshFriends,
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
  onOpenSettings?: () => void;
  onRefreshFriends?: () => void;
}) {
  const { signOut } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestsCount, setRequestsCount] = useState<number | null>(null);

  useEffect(() => {
    // preload request count
    let mounted = true;
    getFriendRequests({ page: 1, per_page: 1 })
      .then((res) => {
        if (!mounted) return;
        const list = res?.friends ?? res?.results ?? res ?? [];
        setRequestsCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => {
        if (mounted) setRequestsCount(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!showSuggestions) return;
    let mounted = true;
    setLoadingSuggestions(true);
    getUnfriendedList()
      .then((res) => {
        if (!mounted) return;
        // API may return { friends: [...] } or direct array
        const list = res?.friends ?? res?.results ?? res ?? [];
        setSuggestions(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        console.error("Failed to load suggestions", err);
        setSuggestions([]);
      })
      .finally(() => {
        if (mounted) setLoadingSuggestions(false);
      });
    return () => {
      mounted = false;
    };
  }, [showSuggestions]);
  return (
    <aside className="chat-sidebar">
      <div className="sidebar-header">
        <div className="header-left">
          <button className="menu-btn" aria-label="menu">
            ☰
          </button>
          <strong className="sidebar-title">Messages</strong>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="new-badge"
            onClick={() => setShowSuggestions((s) => !s)}
            aria-expanded={showSuggestions}
          >
            New
          </button>
          <div style={{ position: "relative" }}>
            <button
              className="notifications-btn"
              onClick={() => setShowNotifications((s) => !s)}
              aria-expanded={showNotifications}
              aria-label="Requests"
            >
              🔔
            </button>
            {requestsCount && requestsCount > 0 ? (
              <div
                className="notif-count"
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#ef4444",
                  color: "white",
                  borderRadius: 999,
                  minWidth: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  padding: "0 6px",
                }}
              >
                {requestsCount}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {showSuggestions && (
        <div className="suggestions-panel">
          <div className="suggestions-header">
            <strong>Suggestions</strong>
            <button
              className="close-suggestions"
              onClick={() => setShowSuggestions(false)}
            >
              ✕
            </button>
          </div>
          {loadingSuggestions ? (
            <div className="suggestions-loading">Loading...</div>
          ) : suggestions.length === 0 ? (
            <div className="suggestions-empty">No suggestions</div>
          ) : (
            <div className="suggestions-list">
              {suggestions.map((s) => (
                <div key={s.id} className="suggestion-item">
                  <div className="suggestion-main">
                    <div className="avatar" style={{ position: "relative" }}>
                      {s.avatar ? (
                        <img src={s.avatar} alt={s.full_name} />
                      ) : (
                        <div className="avatar-fallback">
                          {(s.full_name || s.username || "?")[0]}
                        </div>
                      )}
                    </div>
                    <div className="suggestion-meta">
                      <div className="suggestion-name">
                        {s.full_name || s.username}
                      </div>
                      <div className="suggestion-sub">{s.username}</div>
                    </div>
                  </div>
                  <div className="suggestion-actions">
                    <button
                      className="add-friend-btn"
                      disabled={Boolean(addingMap[String(s.id)])}
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          setAddingMap((m) => ({ ...m, [String(s.id)]: true }));
                          await addFriend({ friend_id: s.id });
                          // remove from suggestions
                          setSuggestions((cur) =>
                            cur.filter((x) => String(x.id) !== String(s.id)),
                          );
                          // optionally notify parent to refresh friends list
                          if (onRefreshFriends) onRefreshFriends();
                        } catch (err) {
                          console.error("Failed to add friend", err);
                        } finally {
                          setAddingMap((m) => ({
                            ...m,
                            [String(s.id)]: false,
                          }));
                        }
                      }}
                    >
                      {addingMap[String(s.id)] ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNotifications && (
        <div className="notifications-panel-wrapper">
          <Notifications
            onAccepted={(id) => {
              // decrement local count
              setRequestsCount((c) => (c && c > 0 ? c - 1 : 0));
              // ask parent to refresh friends list if provided
              if (onRefreshFriends) onRefreshFriends();
            }}
          />
        </div>
      )}

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
                  <img src={c.avatar} alt={c.full_name || c.username} />
                ) : (
                  <div className="avatar-fallback">{(c.full_name || c.username || "?")[0]}</div>
                )}
                {c.status === "online" && <span className="online-dot" />}
              </div>
              <div className="contact-meta">
                <div className="contact-name">{c.full_name || c.username}</div>
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
        <button
          className="settings-btn"
          onClick={() => onOpenSettings && onOpenSettings()}
        >
          ⚙️ Settings
        </button>
        <button className="settings-btn" onClick={signOut}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
