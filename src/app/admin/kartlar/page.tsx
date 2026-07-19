"use client";

import { useEffect, useState } from "react";
import {
  FileJson,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { api, apiSend } from "@/components/admin/api";
import {
  EmptyState,
  Field,
  Loading,
  Modal,
  PageHeader,
  ToastView,
  useToast,
} from "@/components/admin/ui";

const emptyDeck = {
  title: "",
  category: "",
  description: "",
  order: 0,
  cards: [] as any[],
};

export default function AdminDecksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/decks");
      setItems(d.items || []);
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditId(null);
    setImportOpen(false);
    setImportText("");
    setForm({ ...emptyDeck, order: items.length });
  };

  const openEdit = (deck: any) => {
    setEditId(deck._id);
    setImportOpen(false);
    setImportText("");
    setForm({
      ...emptyDeck,
      ...deck,
      cards: (deck.cards || []).map((c: any) => ({ ...c })),
    });
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const setCard = (i: number, patch: any) => {
    const cards = [...form.cards];
    cards[i] = { ...cards[i], ...patch };
    set("cards", cards);
  };

  const importJson = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error();
      const valid = parsed.filter(
        (c: any) => c && typeof c.front === "string" && typeof c.back === "string"
      );
      if (valid.length === 0) throw new Error();
      set("cards", [...form.cards, ...valid.map((c: any) => ({ front: c.front, back: c.back }))]);
      setImportText("");
      setImportOpen(false);
      show(`${valid.length} kart içe aktarıldı`);
    } catch {
      show('Geçersiz JSON. Beklenen format: [{"front":"...","back":"..."}]', "error");
    }
  };

  const save = async () => {
    if (!form.title.trim()) {
      show("Başlık zorunludur", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      delete payload._id;
      if (editId) {
        await apiSend(`/api/admin/decks/${editId}`, "PUT", payload);
        show("Deste güncellendi");
      } else {
        await apiSend("/api/admin/decks", "POST", payload);
        show("Deste oluşturuldu");
      }
      setForm(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (deck: any) => {
    if (!window.confirm(`"${deck.title}" destesini silmek istediğinize emin misiniz?`)) return;
    try {
      await apiSend(`/api/admin/decks/${deck._id}`, "DELETE", {});
      show("Deste silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        label="İçerik Yönetimi"
        title="Öğrenme Kartları"
        action={
          <button type="button" onClick={openCreate} className="btn-primary !px-4 !py-2 text-xs">
            <Plus size={14} strokeWidth={1.5} /> Yeni Deste
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={WalletCards}
          title="Henüz kart destesi yok"
          description="Öğrenme kartları oluşturarak ziyaretçilerin bilgilerini pekiştirmesini sağlayın."
          actionLabel="Yeni Deste Ekle"
          onAction={openCreate}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((deck) => (
            <div key={deck._id} className="card p-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="micro-label mb-1 !text-[0.6875rem]">{deck.category || "Genel"}</p>
                  <h3 className="font-heading font-medium">{deck.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(deck)}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                    aria-label="Düzenle"
                  >
                    <Pencil size={15} strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(deck)}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                    aria-label="Sil"
                  >
                    <Trash2 size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              {deck.description && (
                <p className="mt-2 line-clamp-2 text-xs text-text-secondary">{deck.description}</p>
              )}
              <p className="mt-4 text-xs text-text-muted">
                {(deck.cards || []).length} kart / Sıra: {deck.order ?? 0}
              </p>
            </div>
          ))}
        </div>
      )}

      {form && (
        <Modal title={editId ? "Desteyi Düzenle" : "Yeni Deste"} onClose={() => setForm(null)} wide>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlık">
                <input
                  className="input-dark"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Kategori">
                <input
                  className="input-dark"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                />
              </Field>
              <Field label="Açıklama" className="sm:col-span-2">
                <textarea
                  className="input-dark min-h-[60px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="Sıra">
                <input
                  type="number"
                  className="input-dark"
                  value={form.order}
                  onChange={(e) => set("order", e.target.value)}
                />
              </Field>
            </div>

            {/* Cards */}
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="micro-label">Kartlar ({form.cards.length})</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImportOpen((v) => !v)}
                    className="btn-ghost text-xs"
                  >
                    <FileJson size={14} strokeWidth={1.5} /> JSON içe aktar
                  </button>
                  <button
                    type="button"
                    onClick={() => set("cards", [...form.cards, { front: "", back: "" }])}
                    className="btn-ghost text-xs"
                  >
                    <Plus size={14} strokeWidth={1.5} /> Kart Ekle
                  </button>
                </div>
              </div>

              {importOpen && (
                <div className="mb-4 rounded-xl border border-border-accent bg-bg-secondary p-4">
                  <textarea
                    className="input-dark min-h-[100px] font-mono text-xs"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder='[{"front":"Soru","back":"Cevap"}]'
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button type="button" onClick={() => setImportOpen(false)} className="btn-ghost text-xs">
                      Vazgeç
                    </button>
                    <button type="button" onClick={importJson} className="btn-primary !px-3 !py-1.5 text-xs">
                      İçe Aktar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {form.cards.map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-3 w-6 shrink-0 text-right text-xs text-text-muted">{i + 1}</span>
                    <input
                      className="input-dark !py-2"
                      value={c.front}
                      onChange={(e) => setCard(i, { front: e.target.value })}
                      placeholder="Ön yüz"
                    />
                    <input
                      className="input-dark !py-2"
                      value={c.back}
                      onChange={(e) => setCard(i, { back: e.target.value })}
                      placeholder="Arka yüz"
                    />
                    <button
                      type="button"
                      onClick={() => set("cards", form.cards.filter((_: any, x: number) => x !== i))}
                      className="mt-1 rounded-lg p-2 text-text-secondary hover:text-danger"
                      aria-label="Kartı sil"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                {form.cards.length === 0 && (
                  <p className="text-xs text-text-muted">Henüz kart eklenmedi.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border-subtle pt-5">
              <button type="button" onClick={() => setForm(null)} className="btn-secondary !px-4 !py-2 text-xs">
                Vazgeç
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="btn-primary !px-4 !py-2 text-xs disabled:opacity-60"
              >
                {saving && <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />}
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ToastView toast={toast} />
    </div>
  );
}
