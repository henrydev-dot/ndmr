"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({
  number,
  template,
}: {
  number: string;
  template: string;
}) {
  if (!number) return null;
  const clean = number.replace(/[^0-9]/g, "");
  const href = `https://wa.me/${clean}?text=${encodeURIComponent(template || "")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border-accent bg-surface-elevated text-accent-secondary shadow-glow-sm transition-all duration-300 hover:bg-accent hover:text-white"
    >
      <MessageCircle size={24} strokeWidth={1.5} />
    </a>
  );
}
