import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Gamepad2,
  Library,
  ClipboardList,
  Sparkles,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { dbConnect } from "@/lib/db";
import { Course, LibraryItem } from "@/models";
import HeroWaves from "@/components/HeroWaves";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";

async function getData() {
  try {
    await dbConnect();
    const [courses, libraryItems] = await Promise.all([
      Course.find({ isPublished: true })
        .select("title slug description duration price modules order")
        .sort({ order: 1 })
        .limit(3)
        .lean(),
      LibraryItem.find().sort({ createdAt: -1 }).limit(3).lean(),
    ]);
    return { courses: JSON.parse(JSON.stringify(courses)), libraryItems: JSON.parse(JSON.stringify(libraryItems)) };
  } catch {
    return { courses: [], libraryItems: [] };
  }
}

const TOOLS = [
  {
    href: "/ogrenme-kartlari",
    icon: Layers,
    title: "Öğrenme Kartları",
    text: "Hipnoz terminolojisini 3D çevrimli kartlarla ve aralıklı tekrar yöntemiyle öğrenin.",
  },
  {
    href: "/oyunlar",
    icon: Gamepad2,
    title: "Öğrenme Oyunları",
    text: "Eşleştirme, hafıza, bilgi yarışması ve kelime oyunlarıyla bilginizi pekiştirin.",
  },
  {
    href: "/kutuphane",
    icon: Library,
    title: "Akademik Kütüphane",
    text: "Hipnoz tarihinden nörolojiye uzanan akademik arşiv ve görsel koleksiyon.",
  },
  {
    href: "/testler",
    icon: ClipboardList,
    title: "Psikolojik Testler",
    text: "Bilinçaltı haritanızı ve telkine açıklığınızı keşfeden interaktif testler.",
  },
];

export default async function HomePage() {
  const settings = await getSiteSettings();
  const { courses, libraryItems } = await getData();

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <HeroWaves />
        <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
          <p className="micro-label mb-6">NDMR Antik Hipnoz Eğitimi</p>
          <h1 className="font-heading font-light leading-[1.02] tracking-[-0.03em] text-text-primary [font-size:clamp(3rem,8vw,7rem)]">
            {settings.heroTitleLine1}
            <br />
            <span className="text-accent-secondary">{settings.heroTitleLine2}</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-text-secondary">
            {settings.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/egitimler" className="btn-primary uppercase tracking-wider">
              Eğitimleri İncele <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/randevu" className="btn-secondary">
              Randevu Oluştur
            </Link>
          </div>

          {courses[0] && (
            <div className="mt-16 flex justify-end">
              <Link
                href={`/egitimler/${courses[0].slug}`}
                className="card card-hover group flex w-full max-w-sm items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="micro-label mb-1">Öne Çıkan Eğitim</p>
                  <p className="font-heading text-lg text-text-primary">{courses[0].title}</p>
                  <p className="mt-1 text-sm text-text-muted">{courses[0].duration}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-accent text-accent-secondary transition-all group-hover:bg-accent group-hover:text-white">
                  <ArrowRight size={18} strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Metodoloji */}
      <section className="border-t border-border-subtle bg-bg-secondary">
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-24 md:grid-cols-2">
          <Reveal>
            <p className="micro-label mb-4">Metodoloji</p>
            <h2 className="font-heading text-3xl font-normal leading-snug text-text-primary md:text-4xl">
              Antik bilgelik, modern bilinçaltı bilimi
            </h2>
            <p className="mt-6 leading-[1.75] text-text-secondary">
              NDMR Antik Hipnoz Eğitimi, antik dönem telkin geleneklerini modern bilinçaltı
              çalışmalarıyla birleştiren özgün bir metodolojidir. Bu yaklaşım, zihnin katmanlarına
              sistematik bir yolculuk sunarak kalıcı bilinçaltı değişimini hedefler.
            </p>
            <Link href="/hakkinda" className="btn-ghost mt-8">
              Metodolojiyi Keşfet <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="card relative flex aspect-square items-center justify-center overflow-hidden p-8">
              <svg viewBox="0 0 200 200" className="h-3/4 w-3/4 text-accent" fill="none">
                {Array.from({ length: 9 }).map((_, i) => (
                  <circle
                    key={i}
                    cx="100"
                    cy="100"
                    r={16 + i * 10}
                    stroke="currentColor"
                    strokeWidth="0.75"
                    opacity={0.9 - i * 0.09}
                  />
                ))}
                <circle cx="100" cy="100" r="5" fill="currentColor" />
              </svg>
              <div className="absolute inset-0 bg-accent/5 blur-3xl" />
              <p className="micro-label absolute bottom-6 left-6">Zihnin Katmanları</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Eğitim Paketleri */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <p className="micro-label mb-4">Eğitim Programları</p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-3xl font-normal text-text-primary md:text-4xl">
              Dönüşüm yolculuğunuzu seçin
            </h2>
            <Link href="/egitimler" className="btn-ghost">
              Tüm Eğitimler <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {courses.map((course: any, i: number) => (
            <Reveal key={course.slug} delay={i * 0.1}>
              <div className="card card-hover flex h-full flex-col p-7">
                <p className="micro-label">{course.duration}</p>
                <h3 className="mt-3 font-heading text-xl font-medium text-text-primary">
                  {course.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                  {course.description}
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-border-subtle pt-5">
                  <p className="font-heading text-lg text-text-primary">
                    {Number(course.price).toLocaleString("tr-TR")} ₺
                  </p>
                  <Link href={`/egitimler/${course.slug}`} className="btn-ghost text-accent-secondary">
                    Detaylar <ArrowRight size={15} strokeWidth={1.5} />
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
          {courses.length === 0 && (
            <p className="col-span-3 text-text-muted">Eğitim programları yakında yayınlanacak.</p>
          )}
        </div>
      </section>

      {/* Öğrenme Araçları */}
      <section className="border-y border-border-subtle bg-bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <p className="micro-label mb-4">Öğrenme Araçları</p>
            <h2 className="font-heading text-3xl font-normal text-text-primary md:text-4xl">
              Öğrenmeyi deneyime dönüştürün
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool, i) => (
              <Reveal key={tool.href} delay={i * 0.08}>
                <Link href={tool.href} className="card card-hover group block h-full p-7">
                  <tool.icon
                    size={36}
                    strokeWidth={1.25}
                    className="text-text-secondary transition-colors group-hover:text-accent"
                  />
                  <h3 className="mt-5 font-heading text-lg font-medium text-text-primary">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{tool.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Eğitmen */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="card grid items-center gap-10 overflow-hidden p-10 md:grid-cols-[auto_1fr_auto]">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-border-accent bg-surface-elevated">
              <Sparkles size={40} strokeWidth={1.25} className="text-accent-secondary" />
            </div>
            <div>
              <p className="micro-label mb-2">Eğitmen</p>
              <h2 className="font-heading text-2xl font-medium text-text-primary">Gökhan Işık</h2>
              <p className="mt-1 text-sm text-accent-secondary">
                NDMR Antik Hipnoz Eğitimi Kurucusu | Bilinçaltı Değişimi Uzmanı
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Uluslararası tanınan eğitmen Gökhan Işık, antik telkin geleneklerinin izini sürerek
                geliştirdiği NDMR metodolojisiyle binlerce katılımcının zihinsel dönüşüm
                yolculuğuna eşlik etmektedir.
              </p>
            </div>
            <Link href="/randevu" className="btn-primary whitespace-nowrap">
              <CalendarDays size={16} strokeWidth={1.5} /> Randevu Oluştur
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Test teaser */}
      <section className="border-y border-border-subtle bg-bg-secondary">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
          <Reveal>
            <p className="micro-label mb-4">Bilinçaltını Keşfet</p>
            <h2 className="font-heading text-3xl font-normal text-text-primary md:text-4xl">
              Zihnin hangi katmanında yaşıyorsun?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-text-secondary">
              İnteraktif testlerimizle bilinçaltı haritanı çıkar, telkine açıklığını ölç ve sana
              özel önerileri keşfet.
            </p>
            <Link href="/testler" className="btn-primary mt-8">
              Teste Başla <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Son içerikler */}
      {libraryItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <p className="micro-label mb-4">Arşivden</p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-heading text-3xl font-normal text-text-primary">
                Son eklenen kaynaklar
              </h2>
              <Link href="/kutuphane" className="btn-ghost">
                Kütüphaneye Git <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {libraryItems.map((item: any, i: number) => (
              <Reveal key={item._id} delay={i * 0.1}>
                <div className="card card-hover h-full p-7">
                  <p className="micro-label">
                    {item.category} · {item.year || ""}
                  </p>
                  <h3 className="mt-3 font-heading text-lg font-medium leading-snug text-text-primary">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary line-clamp-3">
                    {item.abstract}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA bandı */}
      <section className="border-t border-border-subtle">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-normal text-text-primary md:text-4xl">
              Dönüşüme hazır mısınız?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/randevu" className="btn-primary">
                <CalendarDays size={16} strokeWidth={1.5} /> Randevu Oluştur
              </Link>
              {settings.contact.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.contact.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(settings.contact.whatsappTemplate)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle size={16} strokeWidth={1.5} /> WhatsApp
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
