"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import {
  GameShell,
  InactiveCard,
  LoadingCard,
  StatChip,
  formatTime,
  shuffle,
} from "./shared";

interface MatchingItem {
  term: string;
  definition: string;
}

interface Pair extends MatchingItem {
  id: number;
}

type Status = "loading" | "inactive" | "error" | "ready";

export default function MatchingGame() {
  const [status, setStatus] = useState<Status>("loading");
  const [allItems, setAllItems] = useState<MatchingItem[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [terms, setTerms] = useState<Pair[]>([]);
  const [definitions, setDefinitions] = useState<Pair[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [wrongPair, setWrongPair] = useState<{ term: number; def: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const wrongTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setupRound = useCallback((items: MatchingItem[]) => {
    const chosen: Pair[] = shuffle(items)
      .slice(0, 6)
      .map((item, i) => ({ ...item, id: i }));
    setPairs(chosen);
    setTerms(shuffle(chosen));
    setDefinitions(shuffle(chosen));
    setMatched([]);
    setSelectedTerm(null);
    setWrongPair(null);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/games?type=matching")
      .then((res) => res.json())
      .then((data: { items: MatchingItem[]; active: boolean }) => {
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

  const isComplete = pairs.length > 0 && matched.length === pairs.length;

  useEffect(() => {
    if (!started || isComplete) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [started, isComplete]);

  useEffect(() => {
    return () => {
      if (wrongTimeout.current) clearTimeout(wrongTimeout.current);
    };
  }, []);

  function handleTermClick(id: number) {
    if (matched.includes(id) || wrongPair) return;
    if (!started) setStarted(true);
    setSelectedTerm(id);
  }

  function handleDefinitionClick(id: number) {
    if (matched.includes(id) || wrongPair || selectedTerm === null) return;
    if (!started) setStarted(true);
    if (selectedTerm === id) {
      setMatched((prev) => [...prev, id]);
      setSelectedTerm(null);
    } else {
      setMoves((m) => m + 1);
      setWrongPair({ term: selectedTerm, def: id });
      wrongTimeout.current = setTimeout(() => {
        setWrongPair(null);
        setSelectedTerm(null);
      }, 650);
    }
  }

  if (status === "loading") {
    return (
      <GameShell label="EŞLEŞTİRME" title="Terimleri Eşleştirin">
        <LoadingCard />
      </GameShell>
    );
  }

  if (status === "inactive") {
    return (
      <GameShell label="EŞLEŞTİRME" title="Terimleri Eşleştirin">
        <InactiveCard />
      </GameShell>
    );
  }

  if (status === "error" || pairs.length === 0) {
    return (
      <GameShell label="EŞLEŞTİRME" title="Terimleri Eşleştirin">
        <div className="card p-12 text-center text-sm text-text-secondary">
          Oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      </GameShell>
    );
  }

  const cardBase =
    "w-full rounded-card border px-4 py-3 text-left text-sm leading-relaxed transition-all duration-300";

  function termClasses(id: number) {
    if (matched.includes(id))
      return `${cardBase} border-success/60 bg-success/5 text-text-muted`;
    if (wrongPair?.term === id)
      return `${cardBase} border-danger bg-danger/10 text-text-primary`;
    if (selectedTerm === id)
      return `${cardBase} border-accent bg-accent/10 text-text-primary shadow-glow-sm`;
    return `${cardBase} border-border-subtle bg-surface-card text-text-secondary hover:border-border-accent hover:text-text-primary`;
  }

  function defClasses(id: number) {
    if (matched.includes(id))
      return `${cardBase} border-success/60 bg-success/5 text-text-muted`;
    if (wrongPair?.def === id)
      return `${cardBase} border-danger bg-danger/10 text-text-primary`;
    return `${cardBase} border-border-subtle bg-surface-card text-text-secondary hover:border-border-accent hover:text-text-primary`;
  }

  return (
    <GameShell
      label="EŞLEŞTİRME"
      title="Terimleri Eşleştirin"
      description="Soldan bir terim, ardından sağdan doğru tanımı seçin. Tüm çiftleri en az hatayla ve en kısa sürede tamamlamaya çalışın."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <StatChip label="Süre" value={formatTime(seconds)} />
        <StatChip label="Hata" value={moves} />
        <StatChip label="Eşleşen" value={`${matched.length}/${pairs.length}`} />
      </div>

      {isComplete ? (
        <div className="card flex flex-col items-center gap-5 p-12 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill border border-border-accent text-accent-secondary">
            <Trophy size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-heading text-2xl font-light text-text-primary">
            Tebrikler, tüm çiftleri eşleştirdiniz
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <StatChip label="Süre" value={formatTime(seconds)} />
            <StatChip label="Hata" value={moves} />
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
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="micro-label mb-4">TERİMLER</p>
            <div className="space-y-3">
              {terms.map((pair) => (
                <button
                  key={`t-${pair.id}`}
                  type="button"
                  className={termClasses(pair.id)}
                  onClick={() => handleTermClick(pair.id)}
                  disabled={matched.includes(pair.id)}
                >
                  {pair.term}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="micro-label mb-4">TANIMLAR</p>
            <div className="space-y-3">
              {definitions.map((pair) => (
                <button
                  key={`d-${pair.id}`}
                  type="button"
                  className={defClasses(pair.id)}
                  onClick={() => handleDefinitionClick(pair.id)}
                  disabled={matched.includes(pair.id)}
                >
                  {pair.definition}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
