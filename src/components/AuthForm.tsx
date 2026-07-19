"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
      router.push(data.user?.role === "admin" ? "/admin" : "/hesabim");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-8">
      <div className="mb-8 flex rounded-pill border border-border-subtle p-1">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-pill py-2 text-sm transition-colors ${
              mode === m ? "bg-accent text-white" : "text-text-secondary"
            }`}
          >
            {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-4">
        {mode === "register" && (
          <input
            className="input-dark"
            placeholder="Ad Soyad"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          className="input-dark"
          type="email"
          placeholder="E-posta"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input-dark"
          type="password"
          placeholder={mode === "register" ? "Şifre (en az 8 karakter)" : "Şifre"}
          required
          minLength={mode === "register" ? 8 : undefined}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {mode === "login" ? (
            <>
              <LogIn size={16} strokeWidth={1.5} /> {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
            </>
          ) : (
            <>
              <UserPlus size={16} strokeWidth={1.5} /> {busy ? "Kayıt yapılıyor..." : "Kayıt Ol"}
            </>
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-xs leading-relaxed text-text-muted">
        Hesabınızla satın aldığınız eğitimlere, test sonuçlarınıza ve randevularınıza
        erişebilirsiniz.
      </p>
    </div>
  );
}
