"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Inbox,
  Mail,
  StickyNote,
  Target,
} from "lucide-react";
import { api, fmtDateTime } from "@/components/admin/api";
import { Loading, PageHeader, ToastView, useToast } from "@/components/admin/ui";

const SERVICE_LABELS: Record<string, string> = {
  "bireysel-seans": "Bireysel Seans",
  "egitim-danismanligi": "Eğitim Danışmanlığı",
  "kurumsal-egitim": "Kurumsal Eğitim",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast, show } = useToast();

  useEffect(() => {
    api("/api/admin/dashboard")
      .then((d) => setData(d))
      .catch((e: any) => show(e.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader label="Genel Bakış" title="Dashboard" />
        <Loading />
      </div>
    );
  }

  const stats = [
    { label: "Bekleyen Randevu", value: data?.pendingAppointments ?? 0, icon: CalendarClock, accent: "text-warning" },
    { label: "Bugünkü Randevu", value: data?.todayAppointments?.length ?? 0, icon: CalendarDays, accent: "text-accent" },
    { label: "Bekleyen Not Onayı", value: data?.pendingNoteCount ?? 0, icon: StickyNote, accent: "text-warning" },
    { label: "Yanıtsız Mesaj", value: data?.unhandledMessageCount ?? 0, icon: Mail, accent: "text-danger" },
    { label: "Toplam Eğitim", value: data?.courseCount ?? 0, icon: GraduationCap, accent: "text-accent" },
    { label: "Aktif Test", value: data?.activeTestCount ?? 0, icon: Target, accent: "text-success" },
    { label: "Çözülen Test", value: data?.testCount ?? 0, icon: ClipboardCheck, accent: "text-accent" },
  ];

  const todayAppointments: any[] = data?.todayAppointments || [];
  const latestNotes: any[] = data?.latestNotes || [];
  const latestMessages: any[] = data?.latestMessages || [];

  return (
    <div>
      <PageHeader label="Genel Bakış" title="Dashboard" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-3xl font-heading font-medium">{s.value}</p>
                  <p className="mt-1 text-xs text-text-secondary">{s.label}</p>
                </div>
                <Icon size={20} strokeWidth={1.5} className={s.accent} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Today's appointments */}
        <div className="card p-6">
          <p className="micro-label mb-4">Bugünkü Randevular</p>
          {todayAppointments.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Inbox size={16} strokeWidth={1.5} /> Bugün için randevu yok
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {todayAppointments.map((a: any, i: number) => (
                <li key={a._id || i} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{a.customerName}</span>
                    <span className="text-accent">{a.timeSlot}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {SERVICE_LABELS[a.serviceType] || a.serviceType}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest notes */}
        <div className="card p-6">
          <p className="micro-label mb-4">Son Notlar</p>
          {latestNotes.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Inbox size={16} strokeWidth={1.5} /> Henüz not yok
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {latestNotes.map((n: any, i: number) => (
                <li key={n._id || i} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{n.nickname}</span>
                    <span
                      className={`rounded-pill px-2 py-0.5 text-[0.6875rem] ${
                        n.isApproved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}
                    >
                      {n.isApproved ? "Onaylı" : "Bekliyor"}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Latest messages */}
        <div className="card p-6">
          <p className="micro-label mb-4">Son Mesajlar</p>
          {latestMessages.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Inbox size={16} strokeWidth={1.5} /> Henüz mesaj yok
            </p>
          ) : (
            <ul className="divide-y divide-border-subtle">
              {latestMessages.map((m: any, i: number) => (
                <li key={m._id || i} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-[0.6875rem] text-text-muted">{fmtDateTime(m.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-secondary">{m.subject}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ToastView toast={toast} />
    </div>
  );
}
