"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, X, type LucideIcon } from "lucide-react";

/* ---------- Toast ---------- */

export type ToastState = { message: string; type: "success" | "error" } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((message: string, type: "success" | "error" = "success") => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, type });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

export function ToastView({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      className={`fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-2.5 rounded-xl border bg-surface-elevated px-4 py-3 text-sm shadow-glow-sm ${
        toast.type === "error" ? "border-danger/40 text-danger" : "border-border-accent text-text-primary"
      }`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={16} strokeWidth={1.5} className="shrink-0" />
      ) : (
        <CheckCircle2 size={16} strokeWidth={1.5} className="shrink-0 text-success" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`card mx-auto my-4 w-full ${wide ? "max-w-3xl" : "max-w-lg"} bg-surface-card p-6`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-heading text-lg font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Kapat"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Toggle ---------- */

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors duration-200 disabled:opacity-50 ${
        checked ? "bg-accent" : "bg-surface-elevated"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

/* ---------- EmptyState ---------- */

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="card flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Icon size={26} strokeWidth={1.5} />
      </div>
      <h3 className="font-heading text-lg font-medium">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary mt-6 !px-4 !py-2 text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ---------- Loading ---------- */

export function Loading() {
  return (
    <div className="card flex items-center justify-center gap-3 p-10 text-sm text-text-secondary">
      <Loader2 size={18} strokeWidth={1.5} className="animate-spin text-accent" />
      Yükleniyor...
    </div>
  );
}

/* ---------- Field ---------- */

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  );
}

/* ---------- PageHeader ---------- */

export function PageHeader({
  label,
  title,
  action,
}: {
  label: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="micro-label mb-1">{label}</p>
        <h1 className="font-heading text-2xl font-medium">{title}</h1>
      </div>
      {action}
    </div>
  );
}
