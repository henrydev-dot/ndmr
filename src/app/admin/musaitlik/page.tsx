"use client";

import { useEffect, useState } from "react";
import { CalendarOff, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { api, apiSend, fmtDate } from "@/components/admin/api";
import { Field, Loading, PageHeader, ToastView, Toggle, useToast } from "@/components/admin/ui";

const DAYS = [
  { n: 1, label: "Pazartesi" },
  { n: 2, label: "Salı" },
  { n: 3, label: "Çarşamba" },
  { n: 4, label: "Perşembe" },
  { n: 5, label: "Cuma" },
  { n: 6, label: "Cumartesi" },
  { n: 0, label: "Pazar" },
];

const DEFAULT_DAY = { enabled: false, startTime: "09:00", endTime: "18:00" };

export default function AdminAvailabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newException, setNewException] = useState("");
  const { toast, show } = useToast();

  useEffect(() => {
    api("/api/admin/availability")
      .then((d) => setData(d.item || d))
      .catch((e: any) => show(e.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDay = (n: number) =>
    (data?.weekdays || []).find((w: any) => w.weekday === n) || { weekday: n, ...DEFAULT_DAY };

  const updateDay = (n: number, patch: any) => {
    setData((prev: any) => {
      const weekdays = [...(prev.weekdays || [])];
      const idx = weekdays.findIndex((w: any) => w.weekday === n);
      if (idx >= 0) weekdays[idx] = { ...weekdays[idx], ...patch };
      else weekdays.push({ weekday: n, ...DEFAULT_DAY, ...patch });
      return { ...prev, weekdays };
    });
  };

  const addException = () => {
    if (!newException) {
      show("Bir tarih seçin", "error");
      return;
    }
    if ((data.exceptions || []).some((e: any) => e.date === newException)) {
      show("Bu tarih zaten eklenmiş", "error");
      return;
    }
    setData((prev: any) => ({
      ...prev,
      exceptions: [...(prev.exceptions || []), { date: newException, closed: true }],
    }));
    setNewException("");
  };

  const removeException = (dateStr: string) => {
    setData((prev: any) => ({
      ...prev,
      exceptions: (prev.exceptions || []).filter((e: any) => e.date !== dateStr),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        weekdays: DAYS.map((d) => {
          const w = getDay(d.n);
          return {
            weekday: d.n,
            enabled: !!w.enabled,
            startTime: w.startTime || "09:00",
            endTime: w.endTime || "18:00",
          };
        }),
        slotDurationMinutes: Number(data.slotDurationMinutes) || 60,
        exceptions: data.exceptions || [],
      };
      await apiSend("/api/admin/availability", "PUT", payload);
      show("Müsaitlik ayarları kaydedildi");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div>
        <PageHeader label="Randevu Yönetimi" title="Müsaitlik" />
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        label="Randevu Yönetimi"
        title="Müsaitlik"
        action={
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary !px-4 !py-2 text-xs disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Save size={14} strokeWidth={1.5} />
            )}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly hours */}
        <div className="card p-6 lg:col-span-2">
          <p className="micro-label mb-5">Haftalık Çalışma Saatleri</p>
          <div className="divide-y divide-border-subtle">
            {DAYS.map((d) => {
              const w = getDay(d.n);
              return (
                <div key={d.n} className="flex flex-wrap items-center gap-4 py-3">
                  <label className="flex w-40 items-center gap-3 text-sm">
                    <Toggle checked={!!w.enabled} onChange={(v) => updateDay(d.n, { enabled: v })} />
                    <span className={w.enabled ? "" : "text-text-muted"}>{d.label}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={w.startTime || "09:00"}
                      disabled={!w.enabled}
                      onChange={(e) => updateDay(d.n, { startTime: e.target.value })}
                      className="input-dark w-auto !py-2 disabled:opacity-40"
                    />
                    <span className="text-text-muted">-</span>
                    <input
                      type="time"
                      value={w.endTime || "18:00"}
                      disabled={!w.enabled}
                      onChange={(e) => updateDay(d.n, { endTime: e.target.value })}
                      className="input-dark w-auto !py-2 disabled:opacity-40"
                    />
                  </div>
                  {!w.enabled && <span className="text-xs text-text-muted">Kapalı</span>}
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border-subtle pt-5">
            <Field label="Randevu Süresi (dakika)" className="max-w-[200px]">
              <select
                value={String(data.slotDurationMinutes || 60)}
                onChange={(e) =>
                  setData((prev: any) => ({ ...prev, slotDurationMinutes: Number(e.target.value) }))
                }
                className="input-dark"
              >
                <option value="30">30 dakika</option>
                <option value="45">45 dakika</option>
                <option value="60">60 dakika</option>
                <option value="90">90 dakika</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Exceptions */}
        <div className="card p-6">
          <p className="micro-label mb-5">Kapalı Günler (İstisnalar)</p>
          <div className="flex gap-2">
            <input
              type="date"
              value={newException}
              onChange={(e) => setNewException(e.target.value)}
              className="input-dark !py-2"
            />
            <button type="button" onClick={addException} className="btn-secondary shrink-0 !px-3 !py-2 text-xs">
              <Plus size={14} strokeWidth={1.5} /> Ekle
            </button>
          </div>

          {(data.exceptions || []).length === 0 ? (
            <p className="mt-5 flex items-center gap-2 text-sm text-text-muted">
              <CalendarOff size={16} strokeWidth={1.5} /> Kapalı gün eklenmedi
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border-subtle">
              {[...(data.exceptions || [])]
                .sort((a: any, b: any) => String(a.date).localeCompare(String(b.date)))
                .map((e: any) => (
                  <li key={e.date} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{fmtDate(e.date)}</span>
                    <button
                      type="button"
                      onClick={() => removeException(e.date)}
                      className="rounded-lg p-1.5 text-text-secondary transition-colors hover:text-danger"
                      aria-label="Kaldır"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </li>
                ))}
            </ul>
          )}
          <p className="mt-5 text-xs text-text-muted">
            Eklenen tarihlerde randevu alınamaz. Değişiklikleri kaydetmeyi unutmayın.
          </p>
        </div>
      </div>

      <ToastView toast={toast} />
    </div>
  );
}
