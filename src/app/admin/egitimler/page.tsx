"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { api, apiSend, moveItem, slugify, uploadFile } from "@/components/admin/api";
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

const emptyCourse = {
  title: "",
  slug: "",
  description: "",
  longDescription: "",
  duration: "",
  price: 0,
  coverImage: "",
  gains: [] as string[],
  faq: [] as any[],
  modules: [] as any[],
  isPublished: false,
  order: 0,
};

export default function AdminCoursesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null); // null = closed
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [gainInput, setGainInput] = useState("");
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/courses");
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
    setGainInput("");
    setForm({ ...emptyCourse, order: items.length });
  };

  const openEdit = (c: any) => {
    setEditId(c._id);
    setGainInput("");
    setForm({
      ...emptyCourse,
      ...c,
      gains: [...(c.gains || [])],
      faq: (c.faq || []).map((f: any) => ({ ...f })),
      modules: (c.modules || []).map((m: any) => ({
        ...m,
        lessons: (m.lessons || []).map((l: any) => ({ ...l })),
      })),
    });
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      show("Başlık ve slug zorunludur", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        order: Number(form.order) || 0,
        modules: form.modules.map((m: any, mi: number) => ({
          ...m,
          order: mi,
          lessons: (m.lessons || []).map((l: any, li: number) => ({ ...l, order: li })),
        })),
      };
      delete payload._id;
      if (editId) {
        await apiSend(`/api/admin/courses/${editId}`, "PUT", payload);
        show("Eğitim güncellendi");
      } else {
        await apiSend("/api/admin/courses", "POST", payload);
        show("Eğitim oluşturuldu");
      }
      setForm(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (c: any) => {
    try {
      await apiSend(`/api/admin/courses/${c._id}`, "PUT", { isPublished: !c.isPublished });
      setItems((prev) =>
        prev.map((x) => (x._id === c._id ? { ...x, isPublished: !c.isPublished } : x))
      );
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const remove = async (c: any) => {
    if (!window.confirm(`"${c.title}" eğitimini silmek istediğinize emin misiniz?`)) return;
    try {
      await apiSend(`/api/admin/courses/${c._id}`, "DELETE", {});
      show("Eğitim silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      set("coverImage", url);
      show("Kapak görseli yüklendi");
    } catch (err: any) {
      show(err.message, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const addGain = () => {
    const v = gainInput.trim();
    if (!v) return;
    set("gains", [...form.gains, v]);
    setGainInput("");
  };

  return (
    <div>
      <PageHeader
        label="İçerik Yönetimi"
        title="Eğitimler"
        action={
          <button type="button" onClick={openCreate} className="btn-primary !px-4 !py-2 text-xs">
            <Plus size={14} strokeWidth={1.5} /> Yeni Eğitim
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Henüz eğitim yok"
          description="İlk eğitiminizi oluşturarak platformda yayınlamaya başlayın."
          actionLabel="Yeni Eğitim Ekle"
          onAction={openCreate}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-4 font-medium text-text-secondary">Başlık</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Fiyat</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Süre</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Sıra</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Yayında</th>
                <th className="px-6 py-4 text-right font-medium text-text-secondary">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-text-muted">/{c.slug}</p>
                  </td>
                  <td className="px-6 py-4">{Number(c.price || 0).toLocaleString("tr-TR")} TL</td>
                  <td className="px-6 py-4 text-text-secondary">{c.duration || "-"}</td>
                  <td className="px-6 py-4 text-text-secondary">{c.order ?? 0}</td>
                  <td className="px-6 py-4">
                    <Toggle checked={!!c.isPublished} onChange={() => togglePublished(c)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                        aria-label="Düzenle"
                      >
                        <Pencil size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(c)}
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

      {form && (
        <Modal title={editId ? "Eğitimi Düzenle" : "Yeni Eğitim"} onClose={() => setForm(null)} wide>
          <div className="space-y-6">
            {/* Basic */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlık" className="sm:col-span-2">
                <input
                  className="input-dark"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Eğitim başlığı"
                />
              </Field>
              <Field label="Slug">
                <div className="flex gap-2">
                  <input
                    className="input-dark"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="egitim-slug"
                  />
                  <button
                    type="button"
                    onClick={() => set("slug", slugify(form.title))}
                    className="btn-secondary shrink-0 !px-3 !py-2 text-xs"
                    title="Başlıktan üret"
                  >
                    <Wand2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </Field>
              <Field label="Süre">
                <input
                  className="input-dark"
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="Örn. 8 hafta"
                />
              </Field>
              <Field label="Fiyat (TL)">
                <input
                  type="number"
                  className="input-dark"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
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
              <Field label="Kısa Açıklama" className="sm:col-span-2">
                <textarea
                  className="input-dark min-h-[70px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="Detaylı Açıklama" className="sm:col-span-2">
                <textarea
                  className="input-dark min-h-[120px]"
                  value={form.longDescription}
                  onChange={(e) => set("longDescription", e.target.value)}
                />
              </Field>
            </div>

            {/* Cover image */}
            <div>
              <p className="micro-label mb-3">Kapak Görseli</p>
              <div className="flex items-center gap-4">
                {form.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.coverImage}
                    alt="Kapak görseli"
                    className="h-20 w-32 rounded-xl border border-border-subtle object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-32 items-center justify-center rounded-xl border border-dashed border-border-subtle text-text-muted">
                    <ImagePlus size={20} strokeWidth={1.5} />
                  </div>
                )}
                <label className="btn-secondary cursor-pointer !px-3 !py-1.5 text-xs">
                  {uploading ? (
                    <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <ImagePlus size={14} strokeWidth={1.5} />
                  )}
                  {uploading ? "Yükleniyor..." : "Görsel Yükle"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
                </label>
                {form.coverImage && (
                  <button
                    type="button"
                    onClick={() => set("coverImage", "")}
                    className="btn-ghost text-xs text-danger hover:text-danger"
                  >
                    Kaldır
                  </button>
                )}
              </div>
            </div>

            {/* Gains */}
            <div>
              <p className="micro-label mb-3">Kazanımlar</p>
              <div className="flex gap-2">
                <input
                  className="input-dark"
                  value={gainInput}
                  onChange={(e) => setGainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addGain();
                    }
                  }}
                  placeholder="Kazanım yazın ve ekleyin"
                />
                <button type="button" onClick={addGain} className="btn-secondary shrink-0 !px-3 !py-2 text-xs">
                  <Plus size={14} strokeWidth={1.5} /> Ekle
                </button>
              </div>
              {form.gains.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.gains.map((g: string, i: number) => (
                    <span
                      key={`${g}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-border-accent bg-accent/10 px-3 py-1 text-xs"
                    >
                      {g}
                      <button
                        type="button"
                        onClick={() =>
                          set("gains", form.gains.filter((_: any, x: number) => x !== i))
                        }
                        className="text-text-secondary hover:text-danger"
                        aria-label="Kaldır"
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="micro-label">Sık Sorulan Sorular</p>
                <button
                  type="button"
                  onClick={() => set("faq", [...form.faq, { question: "", answer: "" }])}
                  className="btn-ghost text-xs"
                >
                  <Plus size={14} strokeWidth={1.5} /> Soru Ekle
                </button>
              </div>
              <div className="space-y-3">
                {form.faq.map((f: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-2">
                        <input
                          className="input-dark"
                          value={f.question}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], question: e.target.value };
                            set("faq", faq);
                          }}
                          placeholder="Soru"
                        />
                        <textarea
                          className="input-dark min-h-[60px]"
                          value={f.answer}
                          onChange={(e) => {
                            const faq = [...form.faq];
                            faq[i] = { ...faq[i], answer: e.target.value };
                            set("faq", faq);
                          }}
                          placeholder="Cevap"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => set("faq", form.faq.filter((_: any, x: number) => x !== i))}
                        className="rounded-lg p-2 text-text-secondary hover:text-danger"
                        aria-label="Soruyu sil"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                {form.faq.length === 0 && (
                  <p className="text-xs text-text-muted">Henüz soru eklenmedi.</p>
                )}
              </div>
            </div>

            {/* Modules */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="micro-label">Modüller</p>
                <button
                  type="button"
                  onClick={() =>
                    set("modules", [
                      ...form.modules,
                      { title: "", order: form.modules.length, lessons: [] },
                    ])
                  }
                  className="btn-ghost text-xs"
                >
                  <Plus size={14} strokeWidth={1.5} /> Modül Ekle
                </button>
              </div>
              <div className="space-y-4">
                {form.modules.map((m: any, mi: number) => (
                  <div key={mi} className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
                    <div className="flex items-center gap-2">
                      <span className="micro-label shrink-0 !text-[0.6875rem]">Modül {mi + 1}</span>
                      <input
                        className="input-dark !py-2"
                        value={m.title}
                        onChange={(e) => {
                          const mods = [...form.modules];
                          mods[mi] = { ...mods[mi], title: e.target.value };
                          set("modules", mods);
                        }}
                        placeholder="Modül başlığı"
                      />
                      <button
                        type="button"
                        disabled={mi === 0}
                        onClick={() => set("modules", moveItem(form.modules, mi, -1))}
                        className="rounded-lg p-1.5 text-text-secondary hover:text-accent disabled:opacity-30"
                        aria-label="Yukarı taşı"
                      >
                        <ChevronUp size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        disabled={mi === form.modules.length - 1}
                        onClick={() => set("modules", moveItem(form.modules, mi, 1))}
                        className="rounded-lg p-1.5 text-text-secondary hover:text-accent disabled:opacity-30"
                        aria-label="Aşağı taşı"
                      >
                        <ChevronDown size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set("modules", form.modules.filter((_: any, x: number) => x !== mi))
                        }
                        className="rounded-lg p-1.5 text-text-secondary hover:text-danger"
                        aria-label="Modülü sil"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Lessons */}
                    <div className="mt-3 space-y-3 border-l border-border-subtle pl-4">
                      {(m.lessons || []).map((l: any, li: number) => (
                        <div key={li} className="rounded-lg border border-border-subtle p-3">
                          <div className="flex items-center gap-2">
                            <input
                              className="input-dark !py-2"
                              value={l.title}
                              onChange={(e) => {
                                const mods = [...form.modules];
                                const lessons = [...mods[mi].lessons];
                                lessons[li] = { ...lessons[li], title: e.target.value };
                                mods[mi] = { ...mods[mi], lessons };
                                set("modules", mods);
                              }}
                              placeholder={`Ders ${li + 1} başlığı`}
                            />
                            <button
                              type="button"
                              disabled={li === 0}
                              onClick={() => {
                                const mods = [...form.modules];
                                mods[mi] = { ...mods[mi], lessons: moveItem(mods[mi].lessons, li, -1) };
                                set("modules", mods);
                              }}
                              className="rounded-lg p-1.5 text-text-secondary hover:text-accent disabled:opacity-30"
                              aria-label="Yukarı taşı"
                            >
                              <ChevronUp size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              disabled={li === m.lessons.length - 1}
                              onClick={() => {
                                const mods = [...form.modules];
                                mods[mi] = { ...mods[mi], lessons: moveItem(mods[mi].lessons, li, 1) };
                                set("modules", mods);
                              }}
                              className="rounded-lg p-1.5 text-text-secondary hover:text-accent disabled:opacity-30"
                              aria-label="Aşağı taşı"
                            >
                              <ChevronDown size={14} strokeWidth={1.5} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const mods = [...form.modules];
                                mods[mi] = {
                                  ...mods[mi],
                                  lessons: mods[mi].lessons.filter((_: any, x: number) => x !== li),
                                };
                                set("modules", mods);
                              }}
                              className="rounded-lg p-1.5 text-text-secondary hover:text-danger"
                              aria-label="Dersi sil"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-2">
                            <input
                              className="input-dark !py-2"
                              value={l.videoUrl || ""}
                              onChange={(e) => {
                                const mods = [...form.modules];
                                const lessons = [...mods[mi].lessons];
                                lessons[li] = { ...lessons[li], videoUrl: e.target.value };
                                mods[mi] = { ...mods[mi], lessons };
                                set("modules", mods);
                              }}
                              placeholder="Video URL"
                            />
                            <input
                              className="input-dark !py-2"
                              value={l.content || ""}
                              onChange={(e) => {
                                const mods = [...form.modules];
                                const lessons = [...mods[mi].lessons];
                                lessons[li] = { ...lessons[li], content: e.target.value };
                                mods[mi] = { ...mods[mi], lessons };
                                set("modules", mods);
                              }}
                              placeholder="İçerik"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const mods = [...form.modules];
                          mods[mi] = {
                            ...mods[mi],
                            lessons: [
                              ...(mods[mi].lessons || []),
                              { title: "", videoUrl: "", content: "", order: (mods[mi].lessons || []).length },
                            ],
                          };
                          set("modules", mods);
                        }}
                        className="btn-ghost text-xs"
                      >
                        <Plus size={14} strokeWidth={1.5} /> Ders Ekle
                      </button>
                    </div>
                  </div>
                ))}
                {form.modules.length === 0 && (
                  <p className="text-xs text-text-muted">Henüz modül eklenmedi.</p>
                )}
              </div>
            </div>

            {/* Publish + actions */}
            <div className="flex items-center justify-between border-t border-border-subtle pt-5">
              <label className="flex items-center gap-3 text-sm">
                <Toggle checked={!!form.isPublished} onChange={(v) => set("isPublished", v)} />
                Yayında
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
