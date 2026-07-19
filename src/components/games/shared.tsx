"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, PauseCircle } from "lucide-react";

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function StatChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-pill border border-border-subtle px-3 py-1 text-xs text-text-secondary">
      <span className="text-text-muted">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </span>
  );
}

export function GameShell({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <Link
        href="/oyunlar"
        className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-secondary"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Tüm Oyunlar
      </Link>
      <div className="mt-8">
        <p className="micro-label">{label}</p>
        <h1 className="mt-3 font-heading text-3xl font-light text-text-primary md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}

export function LoadingCard() {
  return (
    <div className="card flex items-center justify-center gap-3 p-12 text-text-secondary">
      <Loader2 size={20} strokeWidth={1.5} className="animate-spin text-accent-secondary" />
      <span className="text-sm">Yükleniyor…</span>
    </div>
  );
}

export function InactiveCard() {
  return (
    <div className="card flex flex-col items-center gap-4 p-12 text-center">
      <PauseCircle size={32} strokeWidth={1.5} className="text-text-muted" />
      <p className="text-base text-text-primary">Bu oyun şu anda aktif değil</p>
      <p className="max-w-sm text-sm text-text-secondary">
        Lütfen daha sonra tekrar deneyin veya diğer oyunlarımıza göz atın.
      </p>
      <Link href="/oyunlar" className="btn-secondary mt-2">
        Diğer Oyunlar
      </Link>
    </div>
  );
}
