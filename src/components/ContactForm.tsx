"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Mesaj gönderilemedi.");
      setDone(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="card p-10 text-center">
        <p className="font-heading text-xl font-medium text-text-primary">Mesajınız iletildi</p>
        <p className="mt-3 text-sm text-text-secondary">
          En kısa sürede size dönüş yapacağız. Teşekkür ederiz.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          className="input-dark"
          placeholder="Ad Soyad *"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input-dark"
          type="email"
          placeholder="E-posta *"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input-dark sm:col-span-2"
          placeholder="Konu"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
        <textarea
          className="input-dark sm:col-span-2"
          rows={6}
          placeholder="Mesajınız *"
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      <button type="submit" disabled={sending} className="btn-primary mt-6 disabled:opacity-50">
        <Send size={15} strokeWidth={1.5} /> {sending ? "Gönderiliyor..." : "Mesajı Gönder"}
      </button>
    </form>
  );
}
