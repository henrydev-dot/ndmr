"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Layers,
  Loader2,
  PartyPopper,
  RotateCcw,
  Shuffle,
  X,
} from "lucide-react";
import Reveal from "@/components/Reveal";

interface Flashcard {
  front: string;
  back: string;
}

interface Deck {
  _id: string;
  title: string;
  category: string;
  description: string;
  cards: Flashcard[];
}

type Status = "loading" | "error" | "ready";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function progressKey(deckId: string) {
  return `ndmr-deck-progress-${deckId}`;
}

function loadProgress(deckId: string): number[] {
  try {
    const raw = localStorage.getItem(progressKey(deckId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

function saveProgress(deckId: string, learned: number[]) {
  try {
    localStorage.setItem(progressKey(deckId), JSON.stringify(learned));
  } catch {
    // localStorage unavailable
  }
}

export default function FlashcardsApp() {
  const [status, setStatus] = useState<Status>("loading");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [learned, setLearned] = useState<number[]>([]);
  const [queue, setQueue] = useState<number[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [shuffled, setShuffled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/flashcards")
      .then((res) => res.json())
      .then((data: { items: Deck[] }) => {
        if (cancelled) return;
        const items = data.items ?? [];
        setDecks(items);
        const map: Record<string, number> = {};
        for (const deck of items) {
          map[deck._id] = loadProgress(deck._id).length;
        }
        setProgressMap(map);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openDeck = useCallback((deck: Deck) => {
    const learnedIndexes = loadProgress(deck._id).filter(
      (i) => i >= 0 && i < deck.cards.length
    );
    const remaining = deck.cards
      .map((_, i) => i)
      .filter((i) => !learnedIndexes.includes(i));
    setActiveDeck(deck);
    setLearned(learnedIndexes);
    setQueue(remaining);
    setFlipped(false);
    setShuffled(false);
  }, []);

  const backToDecks = useCallback(() => {
    if (activeDeck) {
      setProgressMap((prev) => ({
        ...prev,
        [activeDeck._id]: learned.length,
      }));
    }
    setActiveDeck(null);
  }, [activeDeck, learned]);

  function markKnown() {
    if (!activeDeck || queue.length === 0) return;
    const [currentIndex, ...rest] = queue;
    const nextLearned = [...learned, currentIndex];
    setLearned(nextLearned);
    setQueue(rest);
    setFlipped(false);
    saveProgress(activeDeck._id, nextLearned);
  }

  function markAgain() {
    if (queue.length === 0) return;
    setQueue((prev) => {
      const [head, ...rest] = prev;
      return [...rest, head];
    });
    setFlipped(false);
  }

  function toggleShuffle() {
    setQueue((prev) =>
      shuffled ? [...prev].sort((a, b) => a - b) : shuffle(prev)
    );
    setShuffled((s) => !s);
    setFlipped(false);
  }

  function resetDeck() {
    if (!activeDeck) return;
    saveProgress(activeDeck._id, []);
    setLearned([]);
    setQueue(activeDeck.cards.map((_, i) => i));
    setFlipped(false);
  }

  if (status === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="card flex items-center justify-center gap-3 p-12 text-text-secondary">
          <Loader2
            size={20}
            strokeWidth={1.5}
            className="animate-spin text-accent-secondary"
          />
          <span className="text-sm">Yükleniyor…</span>
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="card p-12 text-center text-sm text-text-secondary">
          Kartlar yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      </section>
    );
  }

  // ---- Study screen ----
  if (activeDeck) {
    const total = activeDeck.cards.length;
    const learnedCount = learned.length;
    const percent = total > 0 ? (learnedCount / total) * 100 : 0;
    const currentIndex = queue[0];
    const currentCard =
      currentIndex !== undefined ? activeDeck.cards[currentIndex] : null;

    return (
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <button
          type="button"
          onClick={backToDecks}
          className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-secondary"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Destelere Dön
        </button>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="micro-label">{activeDeck.category}</p>
            <h1 className="mt-2 font-heading text-3xl font-light text-text-primary">
              {activeDeck.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleShuffle}
              disabled={queue.length < 2}
              className={`inline-flex items-center gap-2 rounded-pill border px-4 py-2 text-xs transition-colors disabled:opacity-40 ${
                shuffled
                  ? "border-border-accent text-accent-secondary"
                  : "border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary"
              }`}
            >
              <Shuffle size={14} strokeWidth={1.5} />
              Karıştır
            </button>
            <button
              type="button"
              onClick={resetDeck}
              className="inline-flex items-center gap-2 rounded-pill border border-border-subtle px-4 py-2 text-xs text-text-secondary transition-colors hover:border-danger hover:text-danger"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              Desteyi sıfırla
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              {learnedCount}/{total} öğrenildi
            </span>
            <span>Kalan: {queue.length}</span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-surface-card">
            <div
              className="h-full rounded-pill bg-accent transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {currentCard ? (
          <>
            <div
              className={`flip-card mt-10 cursor-pointer select-none ${flipped ? "flipped" : ""}`}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setFlipped((f) => !f);
                }
              }}
              aria-label={flipped ? "Cevabı gizle" : "Cevabı göster"}
            >
              <div className="flip-inner relative min-h-[320px]">
                <div className="flip-face absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-card border border-border-subtle bg-surface-card p-10 text-center">
                  <p className="micro-label">SORU</p>
                  <p className="font-heading text-xl font-light leading-relaxed text-text-primary md:text-2xl">
                    {currentCard.front}
                  </p>
                  <p className="text-xs text-text-muted">
                    Çevirmek için karta tıklayın
                  </p>
                </div>
                <div className="flip-face flip-back absolute inset-0 flex flex-col items-center justify-center gap-6 rounded-card border border-border-accent bg-surface-elevated p-10 text-center">
                  <p className="micro-label">CEVAP</p>
                  <p className="text-base leading-relaxed text-text-secondary md:text-lg">
                    {currentCard.back}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={markAgain}
                className="inline-flex items-center gap-2 rounded-pill border border-danger/60 px-6 py-3 text-sm text-danger transition-all hover:bg-danger/10"
              >
                <X size={16} strokeWidth={1.5} />
                Tekrar Et
              </button>
              <button
                type="button"
                onClick={markKnown}
                className="inline-flex items-center gap-2 rounded-pill border border-success/60 px-6 py-3 text-sm text-success transition-all hover:bg-success/10"
              >
                <Check size={16} strokeWidth={1.5} />
                Biliyorum
              </button>
            </div>
          </>
        ) : (
          <div className="card mt-10 flex flex-col items-center gap-5 p-12 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill border border-border-accent text-accent-secondary">
              <PartyPopper size={26} strokeWidth={1.5} />
            </span>
            <h2 className="font-heading text-2xl font-light text-text-primary">
              Desteyi tamamladınız
            </h2>
            <p className="max-w-sm text-sm text-text-secondary">
              Bu destedeki tüm kartları öğrendiniz. Dilerseniz ilerlemeyi
              sıfırlayıp baştan çalışabilirsiniz.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button type="button" className="btn-primary" onClick={resetDeck}>
                <RotateCcw size={16} strokeWidth={1.5} />
                Desteyi sıfırla
              </button>
              <button type="button" className="btn-secondary" onClick={backToDecks}>
                <ArrowLeft size={16} strokeWidth={1.5} />
                Destelere Dön
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ---- Deck selection screen ----
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <Reveal>
        <p className="micro-label">ÖĞRENME KARTLARI</p>
        <h1 className="mt-4 font-heading text-4xl font-light text-text-primary md:text-5xl">
          Kartlarla <span className="text-accent-secondary">tekrar edin</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
          Bir deste seçin, kartı çevirerek cevabı görün ve bildiklerinizi
          işaretleyin. İlerlemeniz bu cihazda saklanır.
        </p>
      </Reveal>

      {decks.length === 0 ? (
        <div className="card mt-14 p-12 text-center text-sm text-text-secondary">
          Şu anda yayınlanmış bir kart destesi bulunmuyor.
        </div>
      ) : (
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck, i) => {
            const learnedCount = Math.min(
              progressMap[deck._id] ?? 0,
              deck.cards.length
            );
            return (
              <Reveal key={deck._id} delay={0.06 * i}>
                <button
                  type="button"
                  onClick={() => openDeck(deck)}
                  className="card card-hover flex h-full w-full flex-col p-8 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-pill border border-border-subtle px-3 py-1 text-xs text-accent-secondary">
                      {deck.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                      <Layers size={14} strokeWidth={1.5} />
                      {deck.cards.length} kart
                    </span>
                  </div>
                  <h2 className="mt-5 font-heading text-xl font-medium text-text-primary">
                    {deck.title}
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">
                    {deck.description}
                  </p>
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-xs text-text-muted">
                      <span>
                        {learnedCount}/{deck.cards.length} öğrenildi
                      </span>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-pill bg-bg-secondary">
                      <div
                        className="h-full rounded-pill bg-accent transition-all duration-500"
                        style={{
                          width: `${
                            deck.cards.length > 0
                              ? (learnedCount / deck.cards.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
