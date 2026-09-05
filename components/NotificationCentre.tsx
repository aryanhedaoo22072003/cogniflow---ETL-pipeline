"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2, X, CheckCircle2, XCircle, Calendar, GitBranch, Share2, Info } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  pipelineName?: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function NotifIcon({ type }: { type: string }) {
  if (type === "run_success") return <CheckCircle2 size={14} className="text-emerald-500" />;
  if (type === "run_failed") return <XCircle size={14} className="text-red-500" />;
  if (type === "schedule_triggered") return <Calendar size={14} className="text-[#2F6FED]" />;
  if (type === "version_restored") return <GitBranch size={14} className="text-[#7C6AE8]" />;
  if (type === "pipeline_shared") return <Share2 size={14} className="text-amber-500" />;
  return <Info size={14} className="text-[#9AA1B2]" />;
}

function notifBg(type: string) {
  if (type === "run_success") return "bg-emerald-50";
  if (type === "run_failed") return "bg-red-50";
  if (type === "schedule_triggered") return "bg-[#2F6FED0A]";
  if (type === "version_restored") return "bg-[#7C6AE80A]";
  if (type === "pipeline_shared") return "bg-amber-50";
  return "bg-[#F4F6FA]";
}

export default function NotificationCentre() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAllRead() {
    await fetch("/api/notifications/read", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function deleteOne(id: string, wasUnread: boolean) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function clearAll() {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(v => !v); if (!open) load(); }}
        title="Notifications"
        className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${open ? "bg-white/20 text-white" : "text-[#5B6480] hover:text-white hover:bg-white/10"}`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel — opens UPWARD and to the RIGHT */}
      {open && (
        <div
          className="absolute z-[100] bg-white rounded-2xl shadow-2xl border border-[#E3E7EF] overflow-hidden"
          style={{
            width: 320,
            bottom: "calc(100% + 8px)", // opens upward
            left: 0,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F2F6] bg-white">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-[#2F6FED]" />
              <span className="text-[13px] font-semibold text-[#1A2233]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button onClick={markAllRead} title="Mark all read"
                  className="w-6 h-6 flex items-center justify-center rounded text-[#9AA1B2] hover:text-[#2F6FED] hover:bg-[#2F6FED10]">
                  <CheckCheck size={13} />
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} title="Clear all"
                  className="w-6 h-6 flex items-center justify-center rounded text-[#9AA1B2] hover:text-red-500 hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded text-[#9AA1B2] hover:text-[#1A2233]">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#9AA1B2]">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={24} className="text-[#E3E7EF] mx-auto mb-2" />
                <p className="text-[12.5px] text-[#9AA1B2]">No notifications yet.</p>
                <p className="text-[11px] text-[#C5CADE] mt-1">Run a pipeline to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F4F6FA]">
                {notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => !n.read && markOneRead(n._id)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer group transition-colors ${!n.read ? "bg-[#2F6FED04] hover:bg-[#2F6FED08]" : "hover:bg-[#FAFBFD]"}`}
                  >
                    {/* Icon */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${notifBg(n.type)}`}>
                      <NotifIcon type={n.type} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <div className={`text-[12px] font-semibold leading-tight ${!n.read ? "text-[#1A2233]" : "text-[#6B7385]"}`}>
                          {n.title}
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteOne(n._id, !n.read); }}
                          className="opacity-0 group-hover:opacity-100 text-[#C5CADE] hover:text-red-400 flex-shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <div className="text-[11px] text-[#6B7385] mt-0.5 leading-relaxed">{n.message}</div>
                      {n.pipelineName && (
                        <div className="text-[10px] font-mono text-[#9AA1B2] mt-0.5 truncate">{n.pipelineName}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-[#C5CADE]">{timeAgo(n.createdAt)}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#2F6FED] flex-shrink-0" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-[#F0F2F6] bg-[#FAFBFD] text-center">
              <span className="text-[10.5px] text-[#9AA1B2]">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · auto-refreshes every 30s
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
