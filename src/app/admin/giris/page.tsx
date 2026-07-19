"use client";

import { useState } from "react";
import { BrainCircuit, Loader2, LogIn } from "lucide-react";
import { Field } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "E-posta veya şifre hatalı");
        return;
      }
      if (data?.user?.role !== "admin") {
        setError("Bu hesap yönetici yetkisine sahip değil");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Bağlantı hatası, lütfen tekrar deneyin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <BrainCircuit size={28} strokeWidth={1.5} />
          </span>
          <p className="micro-label mb-1">NDMR Hipnoz</p>
          <h1 className="font-heading text-2xl font-medium">Yönetici Girişi</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Yönetim paneline erişmek için giriş yapın
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="E-posta">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              placeholder="ornek@eposta.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Şifre">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>

          {error && (
            <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
            {loading ? (
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <LogIn size={16} strokeWidth={1.5} />
            )}
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
