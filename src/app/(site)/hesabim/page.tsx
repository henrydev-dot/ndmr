import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, ClipboardList, CalendarDays, ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User, TestResult, Appointment } from "@/models";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_TR: Record<string, string> = {
  pending: "Onay bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  cancelled: "İptal edildi",
};

const SERVICE_TR: Record<string, string> = {
  "bireysel-seans": "Bireysel Seans",
  "egitim-danismanligi": "Eğitim Danışmanlığı",
  "kurumsal-egitim": "Kurumsal Eğitim",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  let courses: any[] = [];
  let results: any[] = [];
  let appointments: any[] = [];
  try {
    await dbConnect();
    const [user, testResults, appts] = await Promise.all([
      User.findById(session.userId).populate("purchasedCourses", "title slug duration").lean(),
      TestResult.find({ userId: session.userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Appointment.find({ customerEmail: session.email }).sort({ date: -1 }).limit(10).lean(),
    ]);
    courses = JSON.parse(JSON.stringify((user as any)?.purchasedCourses || []));
    results = JSON.parse(JSON.stringify(testResults));
    appointments = JSON.parse(JSON.stringify(appts));
  } catch {}

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="micro-label mb-3">Kullanıcı Paneli</p>
          <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary">
            Merhaba, {session.name}
          </h1>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        {/* Eğitimlerim */}
        <section className="card p-7">
          <p className="micro-label mb-5 flex items-center gap-2">
            <GraduationCap size={15} strokeWidth={1.5} /> Eğitimlerim
          </p>
          {courses.length === 0 ? (
            <div>
              <p className="text-sm text-text-secondary">Henüz satın alınmış eğitiminiz yok.</p>
              <Link href="/egitimler" className="btn-ghost mt-4 text-accent-secondary">
                Eğitimleri İncele <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {courses.map((c: any) => (
                <li key={c.slug}>
                  <Link
                    href={`/egitimler/${c.slug}`}
                    className="block rounded-xl border border-border-subtle p-4 transition-colors hover:border-border-accent"
                  >
                    <p className="font-heading text-sm font-medium text-text-primary">{c.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{c.duration}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Test sonuçlarım */}
        <section className="card p-7">
          <p className="micro-label mb-5 flex items-center gap-2">
            <ClipboardList size={15} strokeWidth={1.5} /> Test Sonuçlarım
          </p>
          {results.length === 0 ? (
            <div>
              <p className="text-sm text-text-secondary">Henüz test çözmediniz.</p>
              <Link href="/testler" className="btn-ghost mt-4 text-accent-secondary">
                Testlere Git <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {results.map((r: any) => (
                <li key={r._id} className="rounded-xl border border-border-subtle p-4">
                  <p className="text-xs text-text-muted">
                    {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">{r.testTitle}</p>
                  <p className="mt-1 font-heading text-sm font-medium text-accent-secondary">
                    {r.resultTitle}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Randevularım */}
        <section className="card p-7">
          <p className="micro-label mb-5 flex items-center gap-2">
            <CalendarDays size={15} strokeWidth={1.5} /> Randevularım
          </p>
          {appointments.length === 0 ? (
            <div>
              <p className="text-sm text-text-secondary">Kayıtlı randevunuz bulunmuyor.</p>
              <Link href="/randevu" className="btn-ghost mt-4 text-accent-secondary">
                Randevu Oluştur <ArrowRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {appointments.map((a: any) => (
                <li key={a._id} className="rounded-xl border border-border-subtle p-4">
                  <p className="font-heading text-sm font-medium text-text-primary">
                    {SERVICE_TR[a.serviceType] || a.serviceType}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {a.date} · {a.timeSlot}
                  </p>
                  <p
                    className={`mt-1.5 text-xs ${
                      a.status === "approved"
                        ? "text-success"
                        : a.status === "pending"
                          ? "text-warning"
                          : "text-danger"
                    }`}
                  >
                    {STATUS_TR[a.status] || a.status}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
