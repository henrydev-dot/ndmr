"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Mail, Trash2 } from "lucide-react";
import { api, apiSend, fmtDateTime } from "@/components/admin/api";
import { EmptyState, Loading, PageHeader, ToastView, useToast } from "@/components/admin/ui";

export default function AdminMessagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/contact-messages");
      setItems(d.items || []);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleHandled = async (m: any) => {
    try {
      await apiSend(`/api/admin/contact-messages/${m._id}`, "PUT", { isHandled: !m.isHandled });
      setItems((prev) =>
        prev.map((x) => (x._id === m._id ? { ...x, isHandled: !m.isHandled } : x))
      );
      show(!m.isHandled ? "Yanıtlandı olarak işaretlendi" : "Yanıtlanmadı olarak işaretlendi");
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const remove = async (m: any) => {
    if (!window.confirm(`${m.name} adlı kişinin mesajını silmek istediğinize emin misiniz?`)) return;
    try {
      await apiSend(`/api/admin/contact-messages/${m._id}`, "DELETE", {});
      show("Mesaj silindi");
      setItems((prev) => prev.filter((x) => x._id !== m._id));
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  return (
    <div>
      <PageHeader label="Topluluk" title="İletişim Mesajları" />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Mesaj kutusu boş"
          description="İletişim formundan gönderilen mesajlar burada listelenir."
        />
      ) : (
        <div className="card divide-y divide-border-subtle">
          {items.map((m) => {
            const expanded = expandedId === m._id;
            return (
              <div key={m._id}>
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : m._id)}
                  className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-surface-elevated/40"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      m.isHandled ? "bg-success" : "bg-warning"
                    }`}
                    title={m.isHandled ? "Yanıtlandı" : "Yanıt bekliyor"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="text-sm font-medium">{m.name}</span>
                      <span className="text-xs text-text-secondary">{m.email}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-text-secondary">
                      {m.subject}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-text-muted sm:block">
                    {fmtDateTime(m.createdAt)}
                  </span>
                  {expanded ? (
                    <ChevronUp size={16} strokeWidth={1.5} className="shrink-0 text-text-muted" />
                  ) : (
                    <ChevronDown size={16} strokeWidth={1.5} className="shrink-0 text-text-muted" />
                  )}
                </button>

                {expanded && (
                  <div className="border-t border-border-subtle bg-bg-secondary px-6 py-5">
                    <p className="whitespace-pre-wrap text-sm text-text-secondary">{m.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleHandled(m)}
                        className={`${
                          m.isHandled ? "btn-secondary" : "btn-primary"
                        } !px-3 !py-1.5 text-xs`}
                      >
                        <CheckCircle2 size={14} strokeWidth={1.5} />
                        {m.isHandled ? "Yanıtlanmadı Olarak İşaretle" : "Yanıtlandı"}
                      </button>
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || ""}`)}`}
                        className="btn-secondary !px-3 !py-1.5 text-xs"
                      >
                        <Mail size={14} strokeWidth={1.5} /> E-posta Gönder
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(m)}
                        className="btn-ghost text-xs text-danger hover:text-danger"
                      >
                        <Trash2 size={14} strokeWidth={1.5} /> Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ToastView toast={toast} />
    </div>
  );
}
