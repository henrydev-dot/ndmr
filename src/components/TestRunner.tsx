"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Share2,
  Link as LinkIcon,
  MessageCircle,
  Twitter,
  Facebook,
  RotateCcw,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface TestData {
  title: string;
  slug: string;
  description: string;
  resultType: "profile" | "range" | "distribution";
  questions: { text: string; options: { text: string }[] }[];
}

export default function TestRunner({ slug }: { slug: string }) {
  const [test, setTest] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.test) setTest(d.test);
        else setError(d.error || "Test bulunamadı.");
      })
      .catch(() => setError("Test yüklenemedi."))
      .finally(() => setLoading(false));
  }, [slug]);

  const selectAnswer = async (idx: number) => {
    const next = [...answers, idx];
    setAnswers(next);
    if (test && next.length === test.questions.length) {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/tests/${slug}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setResult(data);
      } catch (e: any) {
        setError(e.message || "Sonuç hesaplanamadı.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = result
    ? `${test?.title} — Sonucum: ${result.result?.title}. Sen de dene:`
    : test?.title || "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) return <p className="text-sm text-text-muted">Yükleniyor...</p>;
  if (error && !result)
    return (
      <div className="card p-10 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Link href="/testler" className="btn-secondary mt-6 inline-flex">
          Testlere Dön
        </Link>
      </div>
    );
  if (!test) return null;

  /* ------------------------------ Sonuç ekranı ------------------------------ */
  if (result) {
    const dist = result.distribution as Record<string, number> | undefined;
    const radarData = dist
      ? Object.entries(dist).map(([key, value]) => ({
          axis: result.resultLabels?.[key] || key,
          value,
        }))
      : null;

    return (
      <div>
        <p className="micro-label mb-3">Test Sonucun</p>
        <h1 className="font-heading text-3xl font-light text-text-primary md:text-4xl">
          {result.result?.title}
        </h1>

        {radarData && (
          <div className="card mt-8 p-6">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fill: "#9CA0AC", fontSize: 12 }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#8E2DE2"
                    fill="#8E2DE2"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(dist!).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-border-subtle p-3 text-center">
                  <p className="font-heading text-xl text-accent-secondary">%{value}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {result.resultLabels?.[key] || key}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mt-8 space-y-4 p-8">
          <p className="leading-[1.8] text-text-secondary">{result.result?.description}</p>
          {result.result?.recommendation && (
            <p className="border-t border-border-subtle pt-4 text-sm leading-relaxed text-text-secondary">
              {result.result.recommendation}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/randevu" className="btn-primary">
            <CalendarDays size={16} strokeWidth={1.5} /> Danışmanla Randevu Ayarla
          </Link>
          {result.result?.ctaCourseSlug && (
            <Link href={`/egitimler/${result.result.ctaCourseSlug}`} className="btn-secondary">
              Önerilen Eğitimi İncele <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          )}
        </div>

        <div className="mt-10 border-t border-border-subtle pt-6">
          <p className="micro-label mb-4 flex items-center gap-2">
            <Share2 size={14} strokeWidth={1.5} /> Testi Paylaş
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              className="btn-secondary !px-4 !py-2 text-xs"
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} strokeWidth={1.5} /> WhatsApp
            </a>
            <a
              className="btn-secondary !px-4 !py-2 text-xs"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter size={14} strokeWidth={1.5} /> X
            </a>
            <a
              className="btn-secondary !px-4 !py-2 text-xs"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Facebook size={14} strokeWidth={1.5} /> Facebook
            </a>
            <button onClick={copyLink} className="btn-secondary !px-4 !py-2 text-xs">
              <LinkIcon size={14} strokeWidth={1.5} /> {copied ? "Kopyalandı" : "Linki Kopyala"}
            </button>
            <button onClick={restart} className="btn-ghost text-xs">
              <RotateCcw size={14} strokeWidth={1.5} /> Testi Tekrarla
            </button>
          </div>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-text-muted">
          Bu test eğlence ve farkındalık amaçlıdır; klinik tanı değildir.
        </p>
      </div>
    );
  }

  /* ------------------------------ Giriş ekranı ------------------------------ */
  if (!started) {
    return (
      <div>
        <p className="micro-label mb-3">İnteraktif Test</p>
        <h1 className="font-heading text-3xl font-light leading-snug text-text-primary md:text-4xl">
          {test.title}
        </h1>
        <p className="mt-5 leading-[1.8] text-text-secondary">{test.description}</p>
        <p className="mt-3 text-sm text-text-muted">{test.questions.length} soru · yaklaşık 3 dakika</p>
        <button onClick={() => setStarted(true)} className="btn-primary mt-8">
          Teste Başla <ArrowRight size={16} strokeWidth={1.5} />
        </button>
        <p className="mt-10 text-xs text-text-muted">
          Bu test eğlence ve farkındalık amaçlıdır; klinik tanı değildir.
        </p>
      </div>
    );
  }

  /* ------------------------------- Soru ekranı ------------------------------ */
  const question = test.questions[current];
  const progress = ((current + (submitting ? 1 : 0)) / test.questions.length) * 100;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <span>
            Soru {Math.min(current + 1, test.questions.length)} / {test.questions.length}
          </span>
          <span>%{Math.round(progress)}</span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-elevated">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {submitting ? (
        <p className="text-sm text-text-muted">Sonucun hesaplanıyor...</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-heading text-2xl font-normal leading-snug text-text-primary">
              {question.text}
            </h2>
            <div className="mt-8 space-y-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className="card card-hover w-full p-5 text-left text-sm text-text-secondary transition-colors hover:text-text-primary"
                >
                  {option.text}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
