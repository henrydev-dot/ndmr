"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  LayoutGrid,
  List,
  FileText,
  ExternalLink,
  X,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";

const CATEGORIES = ["Tümü", "Tarihçe", "Klinik", "Nöroloji", "NDMR"];

export default function LibraryBrowser() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Tümü");
  const [year, setYear] = useState("Tümü");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/library")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .finally(() => setLoading(false));
  }, []);

  const years = useMemo(() => {
    const ys = Array.from(new Set(items.map((i) => i.year).filter(Boolean))).sort(
      (a: any, b: any) => b - a
    );
    return ["Tümü", ...ys.map(String)];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "Tümü" && item.category !== category) return false;
      if (year !== "Tümü" && String(item.year) !== year) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${item.title} ${item.author} ${item.abstract}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, category, year, query]);

  const galleryImages = useMemo(
    () => items.flatMap((i) => i.images || []),
    [items]
  );

  return (
    <div className="mt-10">
      {/* Filtreler */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-pill border px-4 py-1.5 text-xs transition-colors ${
                category === c
                  ? "border-border-accent bg-accent/15 text-accent-secondary"
                  : "border-border-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input-dark !w-auto !py-1.5 text-xs"
          aria-label="Yıl filtresi"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y === "Tümü" ? "Tüm Yıllar" : y}
            </option>
          ))}
        </select>
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            strokeWidth={1.5}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Arşivde ara..."
            className="input-dark !py-2 pl-10 text-xs"
          />
        </div>
        <div className="flex overflow-hidden rounded-pill border border-border-subtle">
          <button
            onClick={() => setView("grid")}
            aria-label="Izgara görünümü"
            className={`px-3 py-2 ${view === "grid" ? "bg-surface-elevated text-accent-secondary" : "text-text-muted"}`}
          >
            <LayoutGrid size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setView("list")}
            aria-label="Liste görünümü"
            className={`px-3 py-2 ${view === "list" ? "bg-surface-elevated text-accent-secondary" : "text-text-muted"}`}
          >
            <List size={15} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-12 text-sm text-text-muted">Yükleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="card mt-12 flex flex-col items-center gap-3 p-14 text-center">
          <BookOpen size={36} strokeWidth={1.25} className="text-text-muted" />
          <p className="text-sm text-text-secondary">Bu kriterlere uygun kayıt bulunamadı.</p>
        </div>
      ) : view === "grid" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ItemCard key={item._id} item={item} onImage={setLightbox} />
          ))}
        </div>
      ) : (
        <div className="mt-10 divide-y divide-border-subtle rounded-card border border-border-subtle bg-surface-card">
          {filtered.map((item) => (
            <div key={item._id} className="flex flex-wrap items-start justify-between gap-4 p-6">
              <div className="min-w-0 flex-1">
                <p className="micro-label">
                  {item.category} · {item.year || "—"} {item.author ? `· ${item.author}` : ""}
                </p>
                <h3 className="mt-1.5 font-heading text-base font-medium text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.abstract}</p>
              </div>
              <ItemLinks item={item} />
            </div>
          ))}
        </div>
      )}

      {/* Görsel arşiv */}
      {galleryImages.length > 0 && (
        <div className="mt-20">
          <p className="micro-label mb-2">Görsel Arşiv</p>
          <h2 className="font-heading text-2xl font-normal text-text-primary">Arşiv Galerisi</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryImages.map((src, i) => (
              <button
                key={i}
                onClick={() => setLightbox(src)}
                className="group overflow-hidden rounded-card border border-border-subtle"
                aria-label="Görseli büyüt"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt="Arşiv görseli"
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 text-text-secondary hover:text-white"
            aria-label="Kapat"
          >
            <X size={28} strokeWidth={1.5} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="Arşiv görseli" className="max-h-full max-w-full rounded-card" />
        </div>
      )}
    </div>
  );
}

function ItemLinks({ item }: { item: any }) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {item.fileUrl && (
        <a
          href={item.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs"
        >
          <FileText size={14} strokeWidth={1.5} /> PDF
        </a>
      )}
      {item.externalUrl && (
        <a
          href={item.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost text-xs"
        >
          <ExternalLink size={14} strokeWidth={1.5} /> Kaynak
        </a>
      )}
    </div>
  );
}

function ItemCard({ item, onImage }: { item: any; onImage: (src: string) => void }) {
  return (
    <div className="card card-hover flex h-full flex-col p-7">
      <p className="micro-label">
        {item.category} · {item.year || "—"}
      </p>
      <h3 className="mt-3 font-heading text-lg font-medium leading-snug text-text-primary">
        {item.title}
      </h3>
      {item.author && <p className="mt-1 text-xs text-text-muted">{item.author}</p>}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{item.abstract}</p>
      {(item.images || []).length > 0 && (
        <div className="mt-4 flex gap-2">
          {item.images.slice(0, 3).map((src: string, i: number) => (
            <button key={i} onClick={() => onImage(src)} aria-label="Görseli büyüt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-14 w-14 rounded-lg border border-border-subtle object-cover"
              />
            </button>
          ))}
          {item.images.length > 3 && (
            <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-border-subtle text-xs text-text-muted">
              <ImageIcon size={14} strokeWidth={1.5} className="mr-1" /> +{item.images.length - 3}
            </span>
          )}
        </div>
      )}
      <div className="mt-5 border-t border-border-subtle pt-4">
        <ItemLinks item={item} />
      </div>
    </div>
  );
}
