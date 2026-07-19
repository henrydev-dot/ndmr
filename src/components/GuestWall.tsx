"use client";

import { useEffect, useState } from "react";
import { Send, Pin, MessageSquare } from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

export default function GuestWall() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((d) => setNotes(d.items || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mesaj gönderilemedi.");
      setMessage("");
      if (data.pendingModeration) {
        setInfo("Mesajınız alındı. Moderasyon onayının ardından yayınlanacak.");
      } else {
        setInfo("Mesajınız yayınlandı.");
        load();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-12">
      <form onSubmit={submit} className="card p-6">
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <input
            className="input-dark"
            placeholder="Rumuz (opsiyonel)"
            maxLength={40}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <textarea
            className="input-dark"
            rows={3}
            maxLength={500}
            placeholder="Mesajınız..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-text-muted">{message.length}/500</p>
          <button type="submit" disabled={sending || !message.trim()} className="btn-primary !py-2.5 disabled:opacity-40">
            <Send size={15} strokeWidth={1.5} /> {sending ? "Gönderiliyor..." : "Gönder"}
          </button>
        </div>
        {info && <p className="mt-3 text-sm text-success">{info}</p>}
        {error && <p className="mt-3 text-sm text-danger">{error}</p>}
      </form>

      <div className="mt-10 space-y-4">
        {loading ? (
          <p className="text-sm text-text-muted">Yükleniyor...</p>
        ) : notes.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-14 text-center">
            <MessageSquare size={36} strokeWidth={1.25} className="text-text-muted" />
            <p className="text-sm text-text-secondary">
              Henüz not bırakılmamış. İlk mesajı siz yazın.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note._id} className={`card p-6 ${note.isPinned ? "border-border-accent" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-heading text-sm font-medium text-text-primary">
                  {note.nickname || "Misafir"}
                </p>
                <span className="flex items-center gap-2 text-xs text-text-muted">
                  {note.isPinned && <Pin size={13} strokeWidth={1.5} className="text-accent-secondary" />}
                  {timeAgo(note.createdAt)}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                {note.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
