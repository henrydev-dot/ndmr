"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  GraduationCap,
  Building2,
  ChevronLeft,
  ChevronRight,
  Check,
  MessageCircle,
  CalendarDays,
} from "lucide-react";

const SERVICES = [
  {
    key: "bireysel-seans",
    icon: User,
    title: "Bireysel Seans",
    text: "Birebir bilinçaltı çalışması ve kişisel dönüşüm seansı.",
  },
  {
    key: "egitim-danismanligi",
    icon: GraduationCap,
    title: "Eğitim Danışmanlığı",
    text: "Size uygun eğitim programının belirlenmesi için ön görüşme.",
  },
  {
    key: "kurumsal-egitim",
    icon: Building2,
    title: "Kurumsal Eğitim",
    text: "Kurumunuza özel atölye ve eğitim programı planlaması.",
  },
];

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function AppointmentWizard({
  whatsappNumber,
  whatsappTemplate,
}: {
  whatsappNumber: string;
  whatsappTemplate: string;
}) {
  const now = new Date();
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [booked, setBooked] = useState<string[]>([]);
  const [closed, setClosed] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!date) return;
    setSlotsLoading(true);
    setTimeSlot("");
    fetch(`/api/appointments/slots?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        setSlots(d.slots || []);
        setBooked(d.booked || []);
        setClosed(Boolean(d.closed));
      })
      .finally(() => setSlotsLoading(false));
  }, [date]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday-first offset
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const submit = async () => {
    setError("");
    if (!form.name || !form.email || !form.phone) {
      setError("Lütfen ad, e-posta ve telefon alanlarını doldurun.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: service,
          date,
          timeSlot,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Randevu oluşturulamadı.");
      setDone(true);
    } catch (e: any) {
      setError(e.message);
      if (String(e.message).includes("dolduruldu")) {
        // Refresh slots so the stale one disappears.
        const d = await fetch(`/api/appointments/slots?date=${date}`).then((r) => r.json());
        setBooked(d.booked || []);
        setStep(2);
        setTimeSlot("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const serviceTitle = SERVICES.find((s) => s.key === service)?.title || "";

  if (done) {
    const waText = `Merhaba, ${date} tarihinde saat ${timeSlot} için ${serviceTitle} randevusu oluşturdum. (${form.name})`;
    return (
      <div className="card mt-12 p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-success/40 bg-success/10 text-success">
          <Check size={28} strokeWidth={1.5} />
        </span>
        <h2 className="mt-6 font-heading text-2xl font-medium text-text-primary">
          Randevu Talebiniz Alındı
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-secondary">
          {date} tarihinde saat {timeSlot} için {serviceTitle.toLowerCase()} talebiniz oluşturuldu.
          Onaylandığında sizinle iletişime geçilecektir.
        </p>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex"
          >
            <MessageCircle size={16} strokeWidth={1.5} /> WhatsApp ile Teyit Et
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-12">
      {/* Adım göstergesi */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                step > s
                  ? "border-success/40 bg-success/10 text-success"
                  : step === s
                    ? "border-border-accent bg-accent/15 text-accent-secondary"
                    : "border-border-subtle text-text-muted"
              }`}
            >
              {step > s ? <Check size={14} strokeWidth={2} /> : s}
            </span>
            <span className={`hidden text-xs sm:block ${step === s ? "text-text-primary" : "text-text-muted"}`}>
              {s === 1 ? "Hizmet" : s === 2 ? "Tarih & Saat" : "Bilgiler"}
            </span>
            {s < 3 && <span className="h-px flex-1 bg-border-subtle" />}
          </div>
        ))}
      </div>

      {/* Adım 1: Hizmet */}
      {step === 1 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setService(s.key);
                setStep(2);
              }}
              className={`card card-hover p-6 text-left ${
                service === s.key ? "border-border-accent" : ""
              }`}
            >
              <s.icon size={28} strokeWidth={1.25} className="text-accent-secondary" />
              <p className="mt-4 font-heading text-base font-medium text-text-primary">{s.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-text-secondary">{s.text}</p>
            </button>
          ))}
        </div>
      )}

      {/* Adım 2: Tarih & Saat */}
      {step === 2 && (
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <button onClick={prevMonth} className="btn-ghost" aria-label="Önceki ay">
                <ChevronLeft size={18} strokeWidth={1.5} />
              </button>
              <p className="font-heading text-base font-medium text-text-primary">
                {MONTHS[viewMonth]} {viewYear}
              </p>
              <button onClick={nextMonth} className="btn-ghost" aria-label="Sonraki ay">
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-5 grid grid-cols-7 gap-1 text-center">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1 text-xs text-text-muted">
                  {d}
                </span>
              ))}
              {calendarDays.map((d, i) => {
                if (d === null) return <span key={`e${i}`} />;
                const dStr = toDateStr(viewYear, viewMonth, d);
                const isPast = dStr < todayStr;
                const isSelected = dStr === date;
                return (
                  <button
                    key={dStr}
                    disabled={isPast}
                    onClick={() => setDate(dStr)}
                    className={`aspect-square rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-accent text-white"
                        : isPast
                          ? "cursor-not-allowed text-text-muted/40"
                          : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="micro-label mb-4">
              {date ? `${date} için uygun saatler` : "Önce bir gün seçin"}
            </p>
            {date &&
              (slotsLoading ? (
                <p className="text-sm text-text-muted">Saatler yükleniyor...</p>
              ) : closed || slots.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Bu gün için uygun saat bulunmuyor. Lütfen başka bir gün seçin.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((s) => {
                    const isBooked = booked.includes(s);
                    return (
                      <button
                        key={s}
                        disabled={isBooked}
                        onClick={() => setTimeSlot(s)}
                        className={`rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                          timeSlot === s
                            ? "border-border-accent bg-accent/15 text-accent-secondary"
                            : isBooked
                              ? "cursor-not-allowed border-border-subtle text-text-muted/40 line-through"
                              : "border-border-subtle text-text-secondary hover:border-border-accent"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              ))}
            <div className="mt-8 flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary">
                <ChevronLeft size={15} strokeWidth={1.5} /> Geri
              </button>
              <button
                disabled={!date || !timeSlot}
                onClick={() => setStep(3)}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                Devam Et <ChevronRight size={15} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adım 3: Bilgiler */}
      {step === 3 && (
        <div className="mt-10">
          <div className="card mb-6 flex items-center gap-3 p-4 text-sm text-text-secondary">
            <CalendarDays size={16} strokeWidth={1.5} className="text-accent-secondary" />
            {serviceTitle} · {date} · {timeSlot}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              className="input-dark"
              placeholder="Ad Soyad *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              className="input-dark"
              type="email"
              placeholder="E-posta *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="input-dark sm:col-span-2"
              placeholder="Telefon *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <textarea
              className="input-dark sm:col-span-2"
              rows={4}
              placeholder="Eklemek istediğiniz not (opsiyonel)"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </div>
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          <div className="mt-8 flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">
              <ChevronLeft size={15} strokeWidth={1.5} /> Geri
            </button>
            <button
              onClick={submit}
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? "Gönderiliyor..." : "Randevuyu Oluştur"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
