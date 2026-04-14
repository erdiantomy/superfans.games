import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePadelPlayer } from "@/hooks/useArena";
import {
  usePlayerNotifications,
  usePlayerUnreadCount,
  useMarkPlayerNotificationRead,
  useMarkAllPlayerNotificationsRead,
  usePlayerNotificationRealtime,
} from "@/hooks/usePlayerNotifications";
import { C } from "@/components/arena";

export default function PlayerNotificationBell() {
  const { user } = useAuth();
  const { data: me } = usePadelPlayer(user?.id);
  const { data: count = 0 } = usePlayerUnreadCount(me?.id);
  const { data: notifications = [] } = usePlayerNotifications(me?.id);
  const markRead = useMarkPlayerNotificationRead();
  const markAllRead = useMarkAllPlayerNotificationsRead(me?.id);
  const [open, setOpen] = useState(false);

  usePlayerNotificationRealtime(me?.id);

  if (!me) return null;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
          width: 34, height: 34, borderRadius: "50%",
          background: C.card, border: `1px solid ${C.border}`,
          cursor: "pointer",
        }}
        aria-label="Notifications"
      >
        <Bell size={16} color={C.muted} />
        {count > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            background: "#EF4444", color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px",
          }}>
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
          />
          <div style={{
            position: "absolute", top: 42, right: 0, zIndex: 100,
            width: 300, maxHeight: 360, overflowY: "auto",
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 14, boxShadow: `0 12px 40px ${C.bg}cc`,
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Barlow Condensed'" }}>NOTIFICATIONS</span>
              {count > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  style={{
                    background: "none", border: "none", fontSize: 10, color: C.green,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 12, color: C.muted }}>
                No notifications yet
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) markRead.mutate(n.id); }}
                  style={{
                    padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
                    background: n.read ? "transparent" : `${C.green}08`,
                    cursor: n.read ? "default" : "pointer",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
