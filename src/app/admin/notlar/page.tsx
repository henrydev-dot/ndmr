"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Pin,
  PinOff,
  Save,
  StickyNote,
  Trash2,
} from "lucide-react";
import { api, apiSend, fmtDateTime } from "@/components/admin/api";
import {
  EmptyState,
  Field,
  Loading,
  PageHeader,
  ToastView,
  Toggle,
  useToast,
} from "@/components/admin/ui";

export default function AdminNotesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "approved">("pending");
  const [moderationEnabled, setModerationEnabled] = useState(false);
  const [bannedWordsText, setBannedWordsText] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/notes");
      setItems(d.items || []);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api("/api/admin/settings")
      .then((d) => {
        const s = d.item || d;
        setModerationEnabled(!!s.moderationEnabled);
        setBannedWordsText((s.bannedWords || []).join(", "));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (n: any) => {
    try {
      await apiSend(`/api/admin/notes/${n._id}`, "PUT", { isApproved: true });
      show("Not onaylandı");
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isApproved: true } : x)));
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const togglePin = async (n: any) => {
    try {
      await apiSend(`/api/admin/notes/${n._id}`, "PUT", { isPinned: !n.isPinned });
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isPinned: !n.isPinned } : x)));
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const remove = async (n: any) => {
    if (!window.confirm(`${n.nickname} adlı kullanıcının notunu silmek istediğinize emin misiniz?`))
      return;
    try {
      await apiSend(`/api/admin/notes/${n._id}`, "DELETE", {});
      show("Not silindi");
      setItems((prev) => prev.filter((x) => x._id !== n._id));
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const saveModeration = async () => {
    setSavingSettings(true);
    try {
      await apiSend("/api/admin/settings", "PUT", {
        moderationEnabled,
        bannedWords: bannedWordsText
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean),
      });
      show("Moderasyon ayarları kaydedildi");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const pending = items.filter((n) => !n.isApproved);
  const approved = items.filter((n) => n.isApproved);
  const list = tab === "pending" ? pending : approved;

  return (
    <div>
      <PageHeader label="Topluluk" title="Notlar" />

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-pill border border-border-subtle bg-surface-card p-1">
            <button
              type="button"
              onClick={() => setTab("pending")}
              className={`rounded-pill px-4 py-1.5 text-xs transition-colors ${
                tab === "pending"
                  ? "bg-accent font-medium text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Bekleyen ({pending.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("approved")}
              className={`rounded-pill px-4 py-1.5 text-xs transition-colors ${
                tab === "approved"
                  ? "bg-accent font-medium text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Onaylı ({approved.length})
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : list.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title={tab === "pending" ? "Bekleyen not yok" : "Onaylı not yok"}
              description={
                tab === "pending"
                  ? "Onay bekleyen ziyaretçi notu bulunmuyor."
                  : "Henüz onaylanmış not bulunmuyor."
              }
            />
          ) : (
            <div className="space-y-3">
              {list.map((n) => (
                <div key={n._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{n.nickname}</span>
                        {n.isPinned && (
                          <span className="inline-flex items-center gap-1 rounded-pill bg-accent/10 px-2 py-0.5 text-[0.6875rem] text-accent">
                            <Pin size={10} strokeWidth={1.5} /> Sabit
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">{n.message}</p>
                      <p className="mt-2 text-[0.6875rem] text-text-muted">
                        {fmtDateTime(n.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.isApproved && (
                        <button
                          type="button"
                          onClick={() => approve(n)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-success"
                          title="Onayla"
                        >
                          <Check size={16} strokeWidth={1.5} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => togglePin(n)}
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                        title={n.isPinned ? "Sabitlemeyi kaldır" : "Sabitle"}
                      >
                        {n.isPinned ? (
                          <PinOff size={16} strokeWidth={1.5} />
                        ) : (
                          <Pin size={16} strokeWidth={1.5} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(n)}
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                        title="Sil"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Moderation settings */}
        <div className="card h-fit p-6">
          <p className="micro-label mb-5">Moderasyon Ayarları</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              Moderasyon
              <span className="block text-xs text-text-muted">
                Açıkken notlar onaydan sonra yayınlanır
              </span>
            </span>
            <Toggle checked={moderationEnabled} onChange={setModerationEnabled} />
          </label>
          <div className="mt-5">
            <Field label="Yasaklı Kelimeler (virgülle ayırın)">
              <textarea
                className="input-dark min-h-[90px]"
                value={bannedWordsText}
                onChange={(e) => setBannedWordsText(e.target.value)}
                placeholder="kelime1, kelime2, kelime3"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={saveModeration}
            disabled={savingSettings}
            className="btn-primary mt-4 !px-4 !py-2 text-xs disabled:opacity-60"
          >
            {savingSettings ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Save size={14} strokeWidth={1.5} />
            )}
            {savingSettings ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      <ToastView toast={toast} />
    </div>
  );
}
