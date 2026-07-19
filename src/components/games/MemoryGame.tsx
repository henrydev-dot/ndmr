"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Brain, RotateCcw, Sparkles, Trophy } from "lucide-react";
import {
  GameShell,
  InactiveCard,
  LoadingCard,
  StatChip,
  formatTime,
  shuffle,
} from "./shared";

interface MemoryItem {
  term: string;
}

interface MemoryCard {
  id: number;
  pairId: number;
  term: string;
}

type Status = "loading" | "inactive" | "error" | "ready";

export default function MemoryGame() {
  const [status, setStatus] = useState<Status>("loading");
  const [allItems, setAllItems] = useState<MemoryItem[]>([]);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);
  const mismatchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupRound = useCallback((items: MemoryItem[]) => {
    const terms = shuffle(items).slice(0, 8);
    const deck: MemoryCard[] = shuffle(
      terms.flatMap((item, pairId) => [
        { id: pairId * 2, pairId, term: item.term },
        { id: pairId * 2 + 1, pairId, term: item.term },
      ])
    );
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setLocked(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/games?type=memory")
      .then((res) => res.json())
      .then((data: { items: MemoryItem[]; active: boolean }) => {
        if (cancelled) return;
        if (!data.active) {
          setStatus("inactive");
          return;
        }
        setAllItems(data.items ?? []);
        setupRound(data.items ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [setupRound]);

  const totalPairs = cards.length / 2;
  const isComplete = cards.length > 0 && matched.length === totalPairs;

  useEffect(() => {
    if (!started || isComplete) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [started, isComplete]);

  useEffect(() => {
    return () => {
      if (mismatchTimeout.current) clearTimeout(mismatchTimeout.current);
    };
  }, []);

  function handleCardClick(card: MemoryCard) {
    if (locked || flipped.includes(card.id) || matched.includes(card.pairId)) return;
    if (!started) setStarted(true);

    const nextFlipped = [...flipped, card.id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstId, secondId] = nextFlipped;
      const first = cards.find((c) => c.id === firstId);
      const second = cards.find((c) => c.id === secondId);
      if (first && second && first.pairId === second.pairId) {
        setMatched((prev) => [...prev, first.pairId]);
        setFlipped([]);
      } else {
        setLocked(true);
        mismatchTimeout.current = setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  if (status === "loading") {
    return (
      <GameShell label="HAFIZA OYUNU" title="Kart Çiftlerini Bulun">
        <LoadingCard />
      </GameShell>
    );
  }

  if (status === "inactive") {
    return (
      <GameShell label="HAFIZA OYUNU" title="Kart Çiftlerini Bulun">
        <InactiveCard />
      </GameShell>
    );
  }

  if (status === "error" || cards.length === 0) {
    return (
      <GameShell label="HAFIZA OYUNU" title="Kart Çiftlerini Bulun">
        <div className="card p-12 text-center text-sm text-text-secondary">
          Oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      label="HAFIZA OYUNU"
      title="Kart Çiftlerini Bulun"
      description="Kartları çevirerek aynı terime ait çiftleri bulun. Ne kadar az hamlede tamamlarsanız o kadar iyi."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <StatChip label="Süre" value={formatTime(seconds)} />
        <StatChip label="Hamle" value={moves} />
        <StatChip label="Çift" value={`${matched.length}/${totalPairs}`} />
      </div>

      {isComplete ? (
        <div className="card flex flex-col items-center gap-5 p-12 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill border border-border-accent text-accent-secondary">
            <Trophy size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-heading text-2xl font-light text-text-primary">
            Harika, tüm çiftleri buldunuz
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <StatChip label="Süre" value={formatTime(seconds)} />
            <StatChip label="Hamle" value={moves} />
          </div>
          <button
            type="button"
            className="btn-primary mt-2"
            onClick={() => setupRound(allItems)}
          >
            <RotateCcw size={16} strokeWidth={1.5} />
            Tekrar Oyna
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
          {cards.map((card) => {
            const isOpen =
              flipped.includes(card.id) || matched.includes(card.pairId);
            const isMatched = matched.includes(card.pairId);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                className={`flip-card h-28 w-full md:h-32 ${isOpen ? "flipped" : ""}`}
                aria-label={isOpen ? card.term : "Kapalı kart"}
              >
                <div className="flip-inner relative h-full w-full">
                  <div className="flip-face absolute inset-0 flex items-center justify-center rounded-card border border-border-subtle bg-surface-card transition-colors hover:border-border-accent">
                    <Brain
                      size={24}
                      strokeWidth={1.5}
                      className="text-text-muted"
                    />
                  </div>
                  <div
                    className={`flip-face flip-back absolute inset-0 flex items-center justify-center rounded-card border px-2 text-center text-xs leading-snug md:text-sm ${
                      isMatched
                        ? "border-success/60 bg-success/5 text-success"
                        : "border-accent bg-surface-elevated text-text-primary"
                    }`}
                  >
                    {card.term}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {!isComplete && cards.length < 16 ? (
        <p className="mt-6 flex items-center gap-2 text-xs text-text-muted">
          <Sparkles size={14} strokeWidth={1.5} />
          Bu turda {totalPairs} çift bulunuyor.
        </p>
      ) : null}
    </GameShell>
  );
}
