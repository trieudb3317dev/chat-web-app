"use client";

import React, { useEffect, useState } from "react";
import { getFriendRequests, acceptFriend } from "@/apis/client";

export default function Notifications({
  onAccepted,
}: {
  onAccepted?: (userId?: number | string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [acceptingMap, setAcceptingMap] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await getFriendRequests({ page: 1, per_page: 35 });
      const list = res?.friends ?? res?.results ?? res ?? [];
      // sort by requested_at desc (latest first)
      const arr = Array.isArray(list) ? list.slice() : [];
      arr.sort((a: any, b: any) => {
        const ta = new Date(a.requested_at).getTime();
        const tb = new Date(b.requested_at).getTime();
        return tb - ta;
      });
      setItems(arr);
    } catch (err) {
      console.error("Failed to load friend requests", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function doAccept(user: any) {
    const friendId = user.user_id ?? user.id ?? user.friend_id;
    if (!friendId) return;
    try {
      setAcceptingMap((m) => ({ ...m, [String(friendId)]: true }));
      await acceptFriend({ friend_id: friendId });
      // remove from list
      setItems((cur) =>
        cur.filter(
          (x) => String(x.user_id ?? x.id ?? x.friend_id) !== String(friendId),
        ),
      );
      if (onAccepted) onAccepted(friendId);
    } catch (err) {
      console.error("Failed to accept friend", err);
    } finally {
      setAcceptingMap((m) => ({ ...m, [String(friendId)]: false }));
    }
  }

  if (loading) return <div className="notifications-panel">Loading...</div>;

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <strong>Requests</strong>
      </div>
      {items.length === 0 ? (
        <div className="notifications-empty">No requests</div>
      ) : (
        <div className="notifications-list">
          {items.map((u) => (
            <div
              key={u.request_id ?? u.user_id ?? u.id}
              className="notification-item"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div className="avatar">
                  {u.avatar_url ? (
                    <img
                      src={u.avatar_url}
                      alt={u.full_name ?? u.username}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div className="avatar-fallback">
                      {(u.full_name || u.username || "?")[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#111827" }}>
                    {u.full_name ?? u.username}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {u.username}
                  </div>
                </div>
              </div>
              <div>
                <button
                  className="accept-btn"
                  onClick={() => doAccept(u)}
                  disabled={Boolean(
                    acceptingMap[String(u.user_id ?? u.id ?? u.friend_id)],
                  )}
                >
                  {acceptingMap[String(u.user_id ?? u.id ?? u.friend_id)]
                    ? "Accepting..."
                    : "Accept"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
