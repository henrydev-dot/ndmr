import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle, Brain, Trophy, Type, ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Öğrenme Oyunları | NDMR",
  description:
    "Hipnoz eğitimi kavramlarını eşleştirme, hafıza, bilgi yarışması ve kelime tamamlama oyunlarıyla eğlenerek pekiştirin.",
};

const games = [
  {
    href: "/oyunlar/eslestirme",
    icon: Puzzle,
    title: "Eşleştirme",
    description:
      "Terimleri doğru tanımlarla eşleştirin. Süreye ve hamle sayınıza karşı yarışın.",
  },
  {
    href: "/oyunlar/hafiza",
    icon: Brain,
    title: "Hafıza",
    description:
      "Kart çiftlerini bulun, kavramları görsel hafızanıza kazıyın.",
  },
  {
    href: "/oyunlar/bilgi-yarismasi",
    icon: Trophy,
    title: "Bilgi Yarışması",
    description:
      "Süre baskısı altında sorulara yanıt verin, skor tablosunda yerinizi alın.",
  },
  {
    href: "/oyunlar/kelime-tamamlama",
    icon: Type,
    title: "Kelime Tamamlama",
    description:
      "İpuçlarından yola çıkarak eksik harfleri tamamlayın, terminolojinizi güçlendirin.",
  },
];

export default function GamesPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <p className="micro-label">ÖĞRENME OYUNLARI</p>
        <h1 className="mt-4 font-heading text-4xl font-light text-text-primary md:text-5xl">
          Oynayarak <span className="text-accent-secondary">öğrenin</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
          Hipnoz eğitiminde öğrendiğiniz kavramları dört farklı oyunla
          pekiştirin. Her oyun, terminolojiyi ve temel ilkeleri farklı bir
          açıdan tekrar etmeniz için tasarlandı.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {games.map((game, i) => (
          <Reveal key={game.href} delay={0.08 * i}>
            <Link
              href={game.href}
              className="card card-hover group flex h-full flex-col p-8"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-card border border-border-subtle bg-bg-secondary text-accent-secondary">
                <game.icon size={24} strokeWidth={1.5} />
              </span>
              <h2 className="mt-6 font-heading text-xl font-medium text-text-primary">
                {game.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                {game.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent-secondary transition-transform duration-300 group-hover:translate-x-1">
                Oyna
                <ArrowRight size={16} strokeWidth={1.5} />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
