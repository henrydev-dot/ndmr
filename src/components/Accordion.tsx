"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Accordion({
  items,
}: {
  items: { title: string; content: React.ReactNode }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border-subtle rounded-card border border-border-subtle bg-surface-card">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
          >
            <span className="font-heading text-base font-medium text-text-primary">
              {item.title}
            </span>
            <ChevronDown
              size={18}
              strokeWidth={1.5}
              className={`shrink-0 text-text-muted transition-transform ${
                openIndex === i ? "rotate-180 text-accent-secondary" : ""
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="px-6 pb-6 text-sm leading-relaxed text-text-secondary">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
