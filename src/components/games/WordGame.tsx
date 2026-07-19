"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Lightbulb, RotateCcw, Trophy } from "lucide-react";
import {
  GameShell,
  InactiveCard,
  LoadingCard,
  StatChip,
  shuffle,
} from "./shared";

interface WordItem {
  word: string;
  hint: string;
}

interface Puzzle {
  display: string; // uppercase, spaces preserved
  hint: string;
  hiddenIndices: number[];
}

type Status = "loading" | "inactive" | "error" | "ready";
type Feedback = "idle" | "wrong" | "correct";

const MAX_HINTS = 3;

function buildPuzzle(item: WordItem): Puzzle {
  const display = item.word.toLocaleUpperCase("tr-TR");
  const hideable: number[] = [];
  for (let i = 1; i < display.length; i++) {
    if (display[i] !== " ") hideable.push(i);
  }
  const hiddenCount = Math.max(1, Math.round(hideable.length * 0.4));
  const hiddenIndices = shuffle(hideable).slice(0, hiddenCount).sort((a, b) => a - b);
  return { display, hint: item.hint, hiddenIndices };
}

export default function WordGame() {
  const [status, setStatus] = useState<Status>("loading");
  const [rounds, setRounds] = useState<WordItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [values, setValues] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<number[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>("idle");
  const [finished, setFinished] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadWord = useCallback((items: WordItem[], index: number) => {
    setPuzzle(buildPuzzle(items[index]));
    setValues({});
    setRevealed([]);
    setHintsUsed(0);
    setFeedback("idle");
    inputRefs.current = {};
  }, []);

  const startRun = useCallback((items: WordItem[]) => {
    const order = shuffle(items);
    setRounds(order);
    setCurrent(0);
    setSolved(0);
    setFinished(false);
    loadWord(order, 0);
  }, [loadWord]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/games?type=word")
      .then((res) => res.json())
      .then((data: { items: WordItem[]; active: boolean }) => {
        if (cancelled) return;
        if (!data.active) {
          setStatus("inactive");
          return;
        }
        if (!data.items || data.items.length === 0) {
          setStatus("error");
          return;
        }
        startRun(data.items);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [startRun]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function focusNext(fromIndex: number) {
    if (!puzzle) return;
    const next = puzzle.hiddenIndices.find(
      (i) => i > fromIndex && !revealed.includes(i)
    );
    if (next !== undefined) inputRefs.current[next]?.focus();
  }

  function focusPrev(fromIndex: number) {
    if (!puzzle) return;
    const prev = [...puzzle.hiddenIndices]
      .reverse()
      .find((i) => i < fromIndex && !revealed.includes(i));
    if (prev !== undefined) inputRefs.current[prev]?.focus();
  }

  function handleInput(index: number, raw: string) {
    const char = raw.slice(-1).toLocaleUpperCase("tr-TR");
    setValues((prev) => ({ ...prev, [index]: char }));
    if (char) focusNext(index);
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[index]) {
      e.preventDefault();
      focusPrev(index);
    }
  }

  function advanceWord() {
    const nextIndex = current + 1;
    if (nextIndex >= rounds.length) {
      setFinished(true);
    } else {
      setCurrent(nextIndex);
      loadWord(rounds, nextIndex);
    }
  }

  function checkAnswer() {
    if (!puzzle || feedback === "correct") return;
    const allCorrect = puzzle.hiddenIndices.every(
      (i) => (values[i] ?? "") === puzzle.display[i]
    );
    if (allCorrect) {
      setFeedback("correct");
      setSolved((s) => s + 1);
      timeoutRef.current = setTimeout(advanceWord, 1100);
    } else {
      setFeedback("wrong");
      timeoutRef.current = setTimeout(() => setFeedback("idle"), 700);
    }
  }

  function revealHint() {
    if (!puzzle || hintsUsed >= MAX_HINTS || feedback === "correct") return;
    const target = puzzle.hiddenIndices.find(
      (i) => !revealed.includes(i) && (values[i] ?? "") !== puzzle.display[i]
    );
    if (target === undefined) return;
    setValues((prev) => ({ ...prev, [target]: puzzle.display[target] }));
    setRevealed((prev) => [...prev, target]);
    setHintsUsed((h) => h + 1);
  }

  if (status === "loading") {
    return (
      <GameShell label="KELİME TAMAMLAMA" title="Eksik Harfleri Bulun">
        <LoadingCard />
      </GameShell>
    );
  }

  if (status === "inactive") {
    return (
      <GameShell label="KELİME TAMAMLAMA" title="Eksik Harfleri Bulun">
        <InactiveCard />
      </GameShell>
    );
  }

  if (status === "error" || !puzzle) {
    return (
      <GameShell label="KELİME TAMAMLAMA" title="Eksik Harfleri Bulun">
        <div className="card p-12 text-center text-sm text-text-secondary">
          Oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      </GameShell>
    );
  }

  if (finished) {
    return (
      <GameShell label="KELİME TAMAMLAMA" title="Tur Tamamlandı">
        <div className="card flex flex-col items-center gap-5 p-12 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill border border-border-accent text-accent-secondary">
            <Trophy size={26} strokeWidth={1.5} />
          </span>
          <h2 className="font-heading text-2xl font-light text-text-primary">
            Tüm kelimeleri tamamladınız
          </h2>
          <StatChip label="Çözülen" value={`${solved}/${rounds.length}`} />
          <button
            type="button"
            className="btn-primary mt-2"
            onClick={() => startRun(rounds)}
          >
            <RotateCcw size={16} strokeWidth={1.5} />
            Tekrar Oyna
          </button>
        </div>
      </GameShell>
    );
  }

  const boxBase =
    "flex h-11 w-9 items-center justify-center rounded-lg border text-base font-medium md:h-12 md:w-10";

  return (
    <GameShell
      label="KELİME TAMAMLAMA"
      title="Eksik Harfleri Bulun"
      description="İpucunu okuyun ve kelimedeki eksik harfleri tamamlayın. Takılırsanız harf açabilirsiniz."
    >
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <StatChip label="Kelime" value={`${current + 1}/${rounds.length}`} />
        <StatChip label="Çözülen" value={solved} />
        <StatChip label="İpucu" value={`${hintsUsed}/${MAX_HINTS}`} />
      </div>

      <div className="card p-8 md:p-10">
        <p className="micro-label">İPUCU</p>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          {puzzle.hint}
        </p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-2"
          animate={
            feedback === "wrong"
              ? { x: [0, -8, 8, -6, 6, 0] }
              : { x: 0 }
          }
          transition={{ duration: 0.45 }}
        >
          {puzzle.display.split("").map((char, i) => {
            if (char === " ") {
              return <span key={i} className="w-4 md:w-6" aria-hidden="true" />;
            }
            const isHidden = puzzle.hiddenIndices.includes(i);
            if (!isHidden) {
              return (
                <span
                  key={i}
                  className={`${boxBase} border-border-subtle bg-bg-secondary text-text-primary`}
                >
                  {char}
                </span>
              );
            }
            const isRevealed = revealed.includes(i);
            const stateClasses =
              feedback === "correct"
                ? "border-success bg-success/10 text-success"
                : feedback === "wrong"
                ? "border-danger bg-danger/10 text-text-primary"
                : isRevealed
                ? "border-warning/60 bg-warning/5 text-warning"
                : "border-border-accent bg-surface-card text-text-primary focus:border-accent focus:shadow-glow-sm";
            return (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="text"
                autoComplete="off"
                maxLength={2}
                value={values[i] ?? ""}
                readOnly={isRevealed || feedback === "correct"}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`${boxBase} bg-transparent text-center outline-none transition-colors ${stateClasses}`}
                aria-label={`${i + 1}. harf`}
              />
            );
          })}
        </motion.div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn-primary"
            onClick={checkAnswer}
            disabled={feedback === "correct"}
          >
            <Check size={16} strokeWidth={1.5} />
            Kontrol Et
          </button>
          <button
            type="button"
            className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
            onClick={revealHint}
            disabled={hintsUsed >= MAX_HINTS || feedback === "correct"}
          >
            <Lightbulb size={16} strokeWidth={1.5} />
            İpucu: bir harf aç ({MAX_HINTS - hintsUsed})
          </button>
        </div>

        {feedback === "correct" ? (
          <p className="mt-6 text-sm text-success">
            Doğru! Sonraki kelimeye geçiliyor…
          </p>
        ) : null}
        {feedback === "wrong" ? (
          <p className="mt-6 text-sm text-danger">
            Bazı harfler hatalı, tekrar deneyin.
          </p>
        ) : null}
      </div>
    </GameShell>
  );
}
