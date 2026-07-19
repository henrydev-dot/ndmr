import Link from "next/link";
import {
  Award,
  Globe,
  BookOpen,
  Users,
  Sparkles,
  CalendarDays,
  Quote,
} from "lucide-react";
import Reveal from "@/components/Reveal";

export const metadata = {
  title: "Gökhan Işık Hakkında",
  description:
    "NDMR Antik Hipnoz Eğitimi kurucusu, bilinçaltı değişimi uzmanı Gökhan Işık'ın hikâyesi, sertifikaları ve vizyonu.",
};

const CERTS = [
  { icon: Award, title: "Uluslararası Hipnoz Sertifikasyonu", text: "Akredite kurumlardan uygulayıcı ve eğitmen seviyesinde sertifikalar." },
  { icon: Globe, title: "Uluslararası Eğitmenlik", text: "Farklı ülkelerde atölye ve eğitim programları yürütme deneyimi." },
  { icon: BookOpen, title: "NDMR Metodolojisi Kurucusu", text: "Antik telkin geleneklerini modern protokole dönüştüren özgün yaklaşım." },
  { icon: Users, title: "Binlerce Katılımcı", text: "Bireysel seanslar ve grup eğitimleriyle geniş bir dönüşüm topluluğu." },
];

const TIMELINE = [
  {
    year: "İlk Yıllar",
    title: "Zihnin Derinliklerine Merak",
    text: "Bilinçaltının insan davranışı üzerindeki etkisine duyulan merakla başlayan araştırma yolculuğu; klasik hipnoz eğitimleri ve ilk uygulamalar.",
  },
  {
    year: "Araştırma Dönemi",
    title: "Antik Telkin Geleneklerinin İzinde",
    text: "Antik uygarlıkların uyku tapınakları ve telkin ritüelleri üzerine derinlemesine inceleme; bu yapıların modern hipnoz teknikleriyle karşılaştırmalı analizi.",
  },
  {
    year: "Sentez",
    title: "NDMR Metodolojisinin Doğuşu",
    text: "Antik ritim ve sembol dilini modern bilinçaltı protokolleriyle birleştiren NDMR Antik Hipnoz metodolojisinin sistematik hâle getirilmesi.",
  },
  {
    year: "Bugün",
    title: "Uluslararası Eğitmenlik ve Vizyon",
    text: "NDMR eğitim programları, bireysel ve kurumsal çalışmalarla metodolojinin yeni uygulayıcılara aktarılması; kalıcı bilinçaltı değişimini herkes için erişilebilir kılma vizyonu.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      {/* Portre + bio */}
      <div className="grid items-center gap-14 md:grid-cols-[320px_1fr]">
        <Reveal>
          <div className="card relative flex aspect-[3/4] items-center justify-center overflow-hidden">
            <Sparkles size={72} strokeWidth={0.75} className="text-accent/50" />
            <div className="absolute inset-0 bg-accent/5 blur-3xl" />
            <p className="micro-label absolute bottom-5 left-5">Gökhan Işık</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="micro-label mb-4">Hakkında</p>
          <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
            Gökhan Işık
          </h1>
          <p className="mt-2 text-accent-secondary">
            NDMR Antik Hipnoz Eğitimi Kurucusu | Bilinçaltı Değişimi Uzmanı
          </p>
          <div className="mt-6 space-y-4 leading-[1.8] text-text-secondary">
            <p>
              Uluslararası tanınan eğitmen Gökhan Işık, insan zihninin dönüşüm kapasitesine adanmış
              kariyerinde antik telkin geleneklerinin izini sürerek modern bilinçaltı bilimiyle
              buluşturdu. Bu sentezin ürünü olan NDMR Antik Hipnoz metodolojisi, zihnin katmanlarına
              sistematik bir yolculuk sunar.
            </p>
            <p>
              Bireysel seanslardan kurumsal eğitimlere uzanan çalışmalarında binlerce katılımcının
              kalıcı bilinçaltı değişimi deneyimlemesine eşlik etti. Bugün, metodolojisini yeni
              uygulayıcılara aktararak dönüşümün etki alanını genişletmeye devam ediyor.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Sertifikalar */}
      <section className="mt-28">
        <Reveal>
          <p className="micro-label mb-4">Yetkinlikler</p>
          <h2 className="font-heading text-3xl font-normal text-text-primary">
            Sertifikalar ve Deneyim
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CERTS.map((cert, i) => (
            <Reveal key={cert.title} delay={i * 0.08}>
              <div className="card card-hover h-full p-7">
                <cert.icon size={30} strokeWidth={1.25} className="text-accent-secondary" />
                <h3 className="mt-4 font-heading text-base font-medium text-text-primary">
                  {cert.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{cert.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="mt-28">
        <Reveal>
          <p className="micro-label mb-4">Yolculuk</p>
          <h2 className="font-heading text-3xl font-normal text-text-primary">Kariyer Çizelgesi</h2>
        </Reveal>
        <div className="relative mt-12 space-y-12 border-l border-border-subtle pl-8 md:pl-12">
          {TIMELINE.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="relative">
                <span className="absolute -left-[41px] top-1 h-3 w-3 rounded-full border border-border-accent bg-accent md:-left-[57px]" />
                <p className="micro-label">{item.year}</p>
                <h3 className="mt-2 font-heading text-xl font-medium text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-text-secondary">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Referanslar */}
      <section className="mt-28">
        <Reveal>
          <p className="micro-label mb-4">Katılımcı Görüşleri</p>
          <h2 className="font-heading text-3xl font-normal text-text-primary">Referanslar</h2>
        </Reveal>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "NDMR eğitimi, hipnoza bakışımı tamamen değiştirdi. Antik yaklaşımın modern teknikle birleşimi etkileyici.",
              name: "Eğitim Katılımcısı",
            },
            {
              quote:
                "Yıllardır çözemediğim bir örüntünün kök izini tek bir seans dizisinde fark ettim. Sistematik ve derinlikli bir çalışma.",
              name: "Bireysel Danışan",
            },
            {
              quote:
                "Kurumumuz için düzenlenen atölye, ekibin stres yönetiminde gözle görülür bir fark yarattı.",
              name: "Kurumsal Katılımcı",
            },
          ].map((ref, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="card h-full p-7">
                <Quote size={22} strokeWidth={1.25} className="text-accent/60" />
                <p className="mt-4 text-sm leading-[1.8] text-text-secondary">{ref.quote}</p>
                <p className="mt-5 border-t border-border-subtle pt-4 text-xs uppercase tracking-wider text-text-muted">
                  {ref.name}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center">
        <Reveal>
          <h2 className="font-heading text-3xl font-normal text-text-primary">
            Yolculuğa birlikte başlayalım
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/randevu" className="btn-primary">
              <CalendarDays size={16} strokeWidth={1.5} /> Randevu Oluştur
            </Link>
            <Link href="/egitimler" className="btn-secondary">
              Eğitimleri İncele
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
