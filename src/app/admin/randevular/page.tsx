"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarX2,
  Check,
  CalendarClock,
  Loader2,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { api, apiSend, fmtDate } from "@/components/admin/api";
import { EmptyState, Loading, PageHeader, ToastView, useToast } from "@/components/admin/ui";

const SERVICE_LABELS: Record<string, string> = {
  "bireysel-seans": "Bireysel Seans",
  "egitim-danismanligi": "Eğitim Danışmanlığı",
  "kurumsal-egitim": "Kurumsal Eğitim",
};

const STATUS_TABS = [
  { key: "", label: "Tümü" },
  { key: "pending", label: "Bekleyen" },
  { key: "approved", label: "Onaylı" },
  { key: "rejected", label: "Reddedilen" },
  { key: "cancelled", label: "İptal" },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: "Bekliyor", cls: "bg-warning/10 text-warning" },
  approved: { label: "Onaylı", cls: "bg-success/10 text-success" },
  rejected: { label: "Reddedildi", cls: "bg-danger/10 text-danger" },
  cancelled: { label: "İptal", cls: "bg-surface-elevated text-text-muted" },
};

export default function AdminAppointmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [reschedule, setReschedule] = useState<any>(null); // {id, date, timeSlot}
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (date) params.set("date", date);
      const qs = params.toString();
      const d = await api(`/api/admin/appointments${qs ? `?${qs}` : ""}`);
      setItems(d.items || []);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [status, date, show]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatusOf = async (a: any, newStatus: string, successMsg: string) => {
    try {
      await apiSend(`/api/admin/appointments/${a._id}`, "PUT", { status: newStatus });
      show(successMsg);
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const submitReschedule = async () => {
    if (!reschedule?.date || !reschedule?.timeSlot) {
      show("Tarih ve saat seçin", "error");
      return;
    }
    setSaving(true);
    try {
      await apiSend(`/api/admin/appointments/${reschedule.id}`, "PUT", {
        date: reschedule.date,
        timeSlot: reschedule.timeSlot,
      });
      show("Randevu yeniden planlandı");
      setReschedule(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: any) => {
    if (!window.confirm(`${a.customerName} adlı kişinin randevusunu silmek istediğinize emin misiniz?`))
      return;
    try {
      await apiSend(`/api/admin/appointments/${a._id}`, "DELETE", {});
      show("Randevu silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  return (
    <div>
      <PageHeader label="Randevu Yönetimi" title="Randevular" />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-pill border border-border-subtle bg-surface-card p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatus(t.key)}
              className={`rounded-pill px-4 py-1.5 text-xs transition-colors ${
                status === t.key
                  ? "bg-accent font-medium text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-dark w-auto !py-2"
        />
        {date && (
          <button type="button" onClick={() => setDate("")} className="btn-ghost text-xs">
            <X size={14} strokeWidth={1.5} /> Tarihi temizle
          </button>
        )}
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarX2}
          title="Randevu bulunamadı"
          description="Seçili filtrelere uygun randevu yok. Filtreleri değiştirerek tekrar deneyin."
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-4 font-medium text-text-secondary">Müşteri</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Hizmet</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Tarih / Saat</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Not</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Durum</th>
                <th className="px-6 py-4 text-right font-medium text-text-secondary">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((a) => {
                const badge = STATUS_BADGE[a.status] || STATUS_BADGE.pending;
                return (
                  <tr key={a._id} className="align-top">
                    <td className="px-6 py-4">
                      <p className="font-medium">{a.customerName}</p>
                      <p className="text-xs text-text-secondary">{a.customerEmail}</p>
                      <p className="text-xs text-text-secondary">{a.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {SERVICE_LABELS[a.serviceType] || a.serviceType}
                    </td>
                    <td className="px-6 py-4">
                      <p>{fmtDate(a.date)}</p>
                      <p className="text-xs text-accent">{a.timeSlot}</p>
                      {reschedule?.id === a._id && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-border-accent bg-bg-secondary p-2">
                          <input
                            type="date"
                            value={reschedule.date}
                            onChange={(e) =>
                              setReschedule({ ...reschedule, date: e.target.value })
                            }
                            className="input-dark w-auto !px-2 !py-1.5 text-xs"
                          />
                          <input
                            type="time"
                            value={reschedule.timeSlot}
                            onChange={(e) =>
                              setReschedule({ ...reschedule, timeSlot: e.target.value })
                            }
                            className="input-dark w-auto !px-2 !py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={submitReschedule}
                            disabled={saving}
                            className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-60"
                          >
                            {saving && <Loader2 size={12} strokeWidth={1.5} className="animate-spin" />}
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setReschedule(null)}
                            className="btn-ghost text-xs"
                          >
                            Vazgeç
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="max-w-[220px] px-6 py-4 text-xs text-text-secondary">
                      {a.note || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-pill px-2.5 py-1 text-[0.6875rem] ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap justify-end gap-1">
                        {a.status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => setStatusOf(a, "approved", "Randevu onaylandı")}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-success"
                            title="Onayla"
                          >
                            <Check size={16} strokeWidth={1.5} />
                          </button>
                        )}
                        {a.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => setStatusOf(a, "rejected", "Randevu reddedildi")}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                            title="Reddet"
                          >
                            <XCircle size={16} strokeWidth={1.5} />
                          </button>
                        )}
                        {a.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => setStatusOf(a, "cancelled", "Randevu iptal edildi")}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-warning"
                            title="İptal Et"
                          >
                            <CalendarX2 size={16} strokeWidth={1.5} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setReschedule(
                              reschedule?.id === a._id
                                ? null
                                : { id: a._id, date: a.date || "", timeSlot: a.timeSlot || "" }
                            )
                          }
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                          title="Yeniden Planla"
                        >
                          <CalendarClock size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(a)}
                          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                          title="Sil"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ToastView toast={toast} />
    </div>
  );
}
