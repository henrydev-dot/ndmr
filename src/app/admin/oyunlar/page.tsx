"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Gamepad2,
  HelpCircle,
  Loader2,
  Pencil,
  Plus,
  Shuffle,
  Trash2,
  Type,
} from "lucide-react";
import { api, apiSend } from "@/components/admin/api";
import {
  EmptyState,
  Field,
  Loading,
  Modal,
  PageHeader,
  ToastView,
  Toggle,
  useToast,
} from "@/components/admin/ui";

const GAME_TYPES = [
  { key: "quiz", label: "Bilgi Yarışması", icon: HelpCircle },
  { key: "matching", label: "Eşleştirme", icon: Shuffle },
  { key: "memory", label: "Hafıza", icon: Brain },
  { key: "word", label: "Kelime Tamamlama", icon: Type },
];

function emptyItem(gameType: string): any {
  return {
    gameType,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    term: "",
    definition: "",
    word: "",
    hint: "",
    category: "",
    isActive: true,
  };
}

export default function AdminGamesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("quiz");
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        api("/api/admin/game-items"),
        api("/api/admin/game-settings"),
      ]);
      setItems(itemsRes.items || []);
      setSettings(settingsRes.items || []);
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

  const isGameActive = (gameType: string) => {
    const s = settings.find((x) => x.gameType === gameType);
    return s ? !!s.isActive : true;
  };

  const toggleGame = async (gameType: string, isActive: boolean) => {
    try {
      await apiSend("/api/admin/game-settings", "PUT", { gameType, isActive });
      setSettings((prev) => {
        const idx = prev.findIndex((x) => x.gameType === gameType);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], isActive };
          return next;
        }
        return [...prev, { gameType, isActive }];
      });
      show(isActive ? "Oyun aktifleştirildi" : "Oyun devre dışı bırakıldı");
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyItem(tab));
  };

  const openEdit = (item: any) => {
    setEditId(item._id);
    setForm({ ...emptyItem(item.gameType), ...item, options: [...(item.options || ["", "", "", ""])] });
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, correctIndex: Number(form.correctIndex) || 0 };
      delete payload._id;
      if (editId) {
        await apiSend(`/api/admin/game-items/${editId}`, "PUT", payload);
        show("İçerik güncellendi");
      } else {
        await apiSend("/api/admin/game-items", "POST", payload);
        show("İçerik eklendi");
      }
      setForm(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = async (item: any) => {
    try {
      await apiSend(`/api/admin/game-items/${item._id}`, "PUT", { isActive: !item.isActive });
      setItems((prev) =>
        prev.map((x) => (x._id === item._id ? { ...x, isActive: !item.isActive } : x))
      );
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const remove = async (item: any) => {
    if (!window.confirm("Bu içeriği silmek istediğinize emin misiniz?")) return;
    try {
      await apiSend(`/api/admin/game-items/${item._id}`, "DELETE", {});
      show("İçerik silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const filtered = items.filter((i) => i.gameType === tab);
  const tabDef = GAME_TYPES.find((g) => g.key === tab)!;

  const itemTitle = (item: any) => {
    if (item.gameType === "quiz") return item.question;
    if (item.gameType === "matching") return `${item.term} - ${item.definition}`;
    if (item.gameType === "memory") return item.term;
    return item.word;
  };

  return (
    <div>
      <PageHeader
        label="İçerik Yönetimi"
        title="Oyun İçerikleri"
        action={
          <button type="button" onClick={openCreate} className="btn-primary !px-4 !py-2 text-xs">
            <Plus size={14} strokeWidth={1.5} /> Yeni İçerik ({tabDef.label})
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Game settings toggles */}
          <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {GAME_TYPES.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.key} className="card flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="text-[0.6875rem] text-text-muted">
                        {isGameActive(g.key) ? "Aktif" : "Devre dışı"}
                      </p>
                    </div>
                  </div>
                  <Toggle checked={isGameActive(g.key)} onChange={(v) => toggleGame(g.key, v)} />
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="mb-4 flex flex-wrap gap-1 rounded-pill border border-border-subtle bg-surface-card p-1">
            {GAME_TYPES.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setTab(g.key)}
                className={`rounded-pill px-4 py-1.5 text-xs transition-colors ${
                  tab === g.key
                    ? "bg-accent font-medium text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {g.label} ({items.filter((i) => i.gameType === g.key).length})
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={Gamepad2}
              title={`${tabDef.label} için içerik yok`}
              description="Bu oyun türü için henüz içerik eklenmemiş. İlk içeriği ekleyin."
              actionLabel="Yeni İçerik Ekle"
              onAction={openCreate}
            />
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="px-6 py-4 font-medium text-text-secondary">İçerik</th>
                    <th className="px-6 py-4 font-medium text-text-secondary">Kategori</th>
                    <th className="px-6 py-4 font-medium text-text-secondary">Aktif</th>
                    <th className="px-6 py-4 text-right font-medium text-text-secondary">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filtered.map((item) => (
                    <tr key={item._id}>
                      <td className="max-w-[360px] px-6 py-4">
                        <p className="truncate">{itemTitle(item)}</p>
                        {item.gameType === "quiz" && (
                          <p className="mt-0.5 truncate text-xs text-success">
                            Doğru: {(item.options || [])[item.correctIndex] || "-"}
                          </p>
                        )}
                        {item.gameType === "word" && item.hint && (
                          <p className="mt-0.5 truncate text-xs text-text-muted">İpucu: {item.hint}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-secondary">{item.category || "-"}</td>
                      <td className="px-6 py-4">
                        <Toggle checked={!!item.isActive} onChange={() => toggleItem(item)} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                            aria-label="Düzenle"
                          >
                            <Pencil size={16} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(item)}
                            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
                            aria-label="Sil"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {form && (
        <Modal
          title={`${editId ? "İçeriği Düzenle" : "Yeni İçerik"} - ${
            GAME_TYPES.find((g) => g.key === form.gameType)?.label
          }`}
          onClose={() => setForm(null)}
        >
          <div className="space-y-4">
            {form.gameType === "quiz" && (
              <>
                <Field label="Soru">
                  <textarea
                    className="input-dark min-h-[60px]"
                    value={form.question}
                    onChange={(e) => set("question", e.target.value)}
                  />
                </Field>
                <div>
                  <p className="mb-1.5 text-xs font-medium text-text-secondary">
                    Seçenekler (doğru cevabı işaretleyin)
                  </p>
                  <div className="space-y-2">
                    {form.options.map((opt: string, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correctIndex"
                          checked={Number(form.correctIndex) === i}
                          onChange={() => set("correctIndex", i)}
                          className="h-4 w-4 accent-[#8B5CF6]"
                        />
                        <input
                          className="input-dark !py-2"
                          value={opt}
                          onChange={(e) => {
                            const options = [...form.options];
                            options[i] = e.target.value;
                            set("options", options);
                          }}
                          placeholder={`Seçenek ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {form.gameType === "matching" && (
              <>
                <Field label="Terim">
                  <input
                    className="input-dark"
                    value={form.term}
                    onChange={(e) => set("term", e.target.value)}
                  />
                </Field>
                <Field label="Tanım">
                  <textarea
                    className="input-dark min-h-[60px]"
                    value={form.definition}
                    onChange={(e) => set("definition", e.target.value)}
                  />
                </Field>
              </>
            )}

            {form.gameType === "memory" && (
              <Field label="Terim">
                <input
                  className="input-dark"
                  value={form.term}
                  onChange={(e) => set("term", e.target.value)}
                />
              </Field>
            )}

            {form.gameType === "word" && (
              <>
                <Field label="Kelime">
                  <input
                    className="input-dark"
                    value={form.word}
                    onChange={(e) => set("word", e.target.value)}
                  />
                </Field>
                <Field label="İpucu">
                  <input
                    className="input-dark"
                    value={form.hint}
                    onChange={(e) => set("hint", e.target.value)}
                  />
                </Field>
              </>
            )}

            <Field label="Kategori">
              <input
                className="input-dark"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between border-t border-border-subtle pt-4">
              <label className="flex items-center gap-3 text-sm">
                <Toggle checked={!!form.isActive} onChange={(v) => set("isActive", v)} />
                Aktif
              </label>
              <div className="flex gap-2">
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
          </div>
        </Modal>
      )}

      <ToastView toast={toast} />
    </div>
  );
}
