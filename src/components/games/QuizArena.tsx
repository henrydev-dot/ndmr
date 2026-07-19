"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Trophy } from "lucide-react";
import {
  GameShell,
  InactiveCard,
  LoadingCard,
  StatChip,
  shuffle,
} from "./shared";

interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
}

interface ScoreEntry {
  name?: string;
  score: number;
  date: string;
}

type Phase = "loading" | "inactive" | "error" | "start" | "play" | "finished";

const STORAGE_KEY = "ndmr-quiz-scores";
const QUESTION_TIME = 20;
const QUESTION_COUNT = 10;

function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScoreEntry[]) : [];
  } catch {
    return [];
  }
}

function Scoreboard({ scores }: { scores: ScoreEntry[] }) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        Henüz kayıtlı skor yok. İlk skoru siz ekleyin.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs uppercase tracking-wider text-text-muted">
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Oyuncu</th>
            <th className="py-2 pr-4 font-medium">Puan</th>
            <th className="py-2 font-medium">Tarih</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((entry, i) => (
            <tr
              key={`${entry.date}-${i}`}
              className="border-b border-border-subtle/50 text-text-secondary"
            >
              <td className="py-2 pr-4 text-text-muted">{i + 1}</td>
              <td className="py-2 pr-4">{entry.name || "Anonim"}</td>
              <td className="py-2 pr-4 font-medium text-text-primary">
                {entry.score}
              </td>
              <td className="py-2 text-text-muted">
                {new Date(entry.date).toLocaleDateString("tr-TR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function QuizArena() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [allItems, setAllItems] = useState<QuizItem[]>([]);
  const [questions, setQuestions] = useState<QuizItem[]>([]);
  const [name, setName] = useState("");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answered, setAnswered] = useState<number | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    setScores(loadScores());
    let cancelled = false;
    fetch("/api/games?type=quiz")
      .then((res) => res.json())
      .then((data: { items: QuizItem[]; active: boolean }) => {
        if (cancelled) return;
        if (!data.active) {
          setPhase("inactive");
          return;
        }
        if (!data.items || data.items.length === 0) {
          setPhase("error");
          return;
        }
        setAllItems(data.items);
        setPhase("start");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  const startGame = useCallback(() => {
    setQuestions(shuffle(allItems).slice(0, QUESTION_COUNT));
    setCurrent(0);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(QUESTION_TIME);
    setAnswered(null);
    savedRef.current = false;
    setPhase("play");
  }, [allItems]);

  const advance = useCallback(() => {
    setCurrent((prev) => {
      if (prev + 1 >= questions.length) {
        setPhase("finished");
        return prev;
      }
      setTimeLeft(QUESTION_TIME);
      setAnswered(null);
      return prev + 1;
    });
  }, [questions.length]);

  // Countdown
  useEffect(() => {
    if (phase !== "play" || answered !== null) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, answered, current]);

  // Timeout counts as wrong
  useEffect(() => {
    if (phase !== "play" || answered !== null || timeLeft > 0) return;
    setAnswered(-1);
    advanceTimeout.current = setTimeout(advance, 1500);
  }, [phase, answered, timeLeft, advance]);

  // Save score once on finish
  useEffect(() => {
    if (phase !== "finished" || savedRef.current) return;
    savedRef.current = true;
    const entry: ScoreEntry = {
      ...(name.trim() ? { name: name.trim() } : {}),
      score,
      date: new Date().toISOString(),
    };
    const next = [...loadScores(), entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage unavailable
    }
    setScores(next);
  }, [phase, name, score]);

  function handleAnswer(index: number) {
    if (answered !== null) return;
    const question = questions[current];
    setAnswered(index);
    if (index === question.correctIndex) {
      const bonus = Math.round((timeLeft / QUESTION_TIME) * 5);
      setScore((s) => s + 10 + bonus);
      setCorrectCount((c) => c + 1);
    }
    advanceTimeout.current = setTimeout(advance, 1400);
  }

  if (phase === "loading") {
    return (
      <GameShell label="BİLGİ YARIŞMASI" title="Bilginizi Test Edin">
        <LoadingCard />
      </GameShell>
    );
  }

  if (phase === "inactive") {
    return (
      <GameShell label="BİLGİ YARIŞMASI" title="Bilginizi Test Edin">
        <InactiveCard />
      </GameShell>
    );
  }

  if (phase === "error") {
    return (
      <GameShell label="BİLGİ YARIŞMASI" title="Bilginizi Test Edin">
        <div className="card p-12 text-center text-sm text-text-secondary">
          Oyun verileri yüklenemedi. Lütfen sayfayı yenileyin.
        </div>
      </GameShell>
    );
  }

  if (phase === "start") {
    return (
      <GameShell
        label="BİLGİ YARIŞMASI"
        title="Bilginizi Test Edin"
        description={`${Math.min(QUESTION_COUNT, allItems.length)} soru, her soru için ${QUESTION_TIME} saniye. Doğru cevap 10 puan, hız bonusu 5 puana kadar.`}
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <p className="micro-label">BAŞLAMADAN ÖNCE</p>
            <h2 className="mt-3 font-heading text-xl font-light text-text-primary">
              Takma adınız (isteğe bağlı)
            </h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Örn. Hipnos"
              className="input-dark mt-5 w-full"
            />
            <button type="button" className="btn-primary mt-6" onClick={startGame}>
              <Play size={16} strokeWidth={1.5} />
              Başla
            </button>
          </div>
          <div className="card p-8">
            <p className="micro-label mb-5">SKOR TABLOSU</p>
            <Scoreboard scores={scores} />
          </div>
        </div>
      </GameShell>
    );
  }

  if (phase === "finished") {
    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <GameShell label="BİLGİ YARIŞMASI" title="Yarışma Tamamlandı">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card flex flex-col items-center gap-5 p-10 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-pill border border-border-accent text-accent-secondary">
              <Trophy size={26} strokeWidth={1.5} />
            </span>
            <p className="font-heading text-5xl font-light text-text-primary">
              {score}
              <span className="ml-2 text-base text-text-muted">puan</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <StatChip label="Doğru" value={`${correctCount}/${total}`} />
              <StatChip label="Başarı" value={`%${percentage}`} />
            </div>
            <button type="button" className="btn-primary mt-2" onClick={startGame}>
              <RotateCcw size={16} strokeWidth={1.5} />
              Tekrar Oyna
            </button>
          </div>
          <div className="card p-8">
            <p className="micro-label mb-5">SKOR TABLOSU</p>
            <Scoreboard scores={scores} />
          </div>
        </div>
      </GameShell>
    );
  }

  // phase === "play"
  const question = questions[current];
  const progress = (current / questions.length) * 100;

  function optionClasses(index: number) {
    const base =
      "w-full rounded-card border px-5 py-4 text-left text-sm leading-relaxed transition-all duration-300";
    if (answered === null) {
      return `${base} border-border-subtle bg-surface-card text-text-secondary hover:border-border-accent hover:text-text-primary`;
    }
    if (index === question.correctIndex) {
      return `${base} border-success bg-success/10 text-text-primary`;
    }
    if (index === answered) {
      return `${base} border-danger bg-danger/10 text-text-primary`;
    }
    return `${base} border-border-subtle bg-surface-card text-text-muted opacity-60`;
  }

  return (
    <GameShell label="BİLGİ YARIŞMASI" title="Bilginizi Test Edin">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatChip label="Soru" value={`${current + 1}/${questions.length}`} />
        <StatChip label="Puan" value={score} />
        <span
          className={`inline-flex items-center gap-2 rounded-pill border px-3 py-1 text-xs ${
            timeLeft <= 5 && answered === null
              ? "border-danger text-danger"
              : "border-border-subtle text-text-secondary"
          }`}
        >
          <Timer size={14} strokeWidth={1.5} />
          <span className="font-medium">{timeLeft}s</span>
        </span>
      </div>

      <div className="mb-8 h-1 w-full overflow-hidden rounded-pill bg-surface-card">
        <div
          className="h-full rounded-pill bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="card p-8 md:p-10">
        {question.category ? (
          <p className="micro-label mb-4">{question.category}</p>
        ) : null}
        <h2 className="font-heading text-xl font-light leading-relaxed text-text-primary md:text-2xl">
          {question.question}
        </h2>
        {answered === -1 ? (
          <p className="mt-4 text-sm text-danger">
            Süre doldu. Doğru cevap işaretlendi.
          </p>
        ) : null}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              className={optionClasses(i)}
              onClick={() => handleAnswer(i)}
              disabled={answered !== null}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
