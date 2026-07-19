"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { api, apiSend, slugify } from "@/components/admin/api";
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

const RESULT_TYPES = [
  { key: "profile", label: "Profil" },
  { key: "range", label: "Puan Aralığı" },
  { key: "distribution", label: "Dağılım" },
];

const emptyTest = {
  title: "",
  slug: "",
  description: "",
  resultType: "profile",
  questions: [] as any[],
  results: [] as any[],
  isActive: false,
};

// form uses scoreRows: [{key, value}] instead of scores Record
function toForm(test: any) {
  return {
    ...emptyTest,
    ...test,
    questions: (test.questions || []).map((q: any) => ({
      text: q.text || "",
      options: (q.options || []).map((o: any) => ({
        text: o.text || "",
        scoreRows: Object.entries(o.scores || {}).map(([key, value]) => ({ key, value })),
      })),
    })),
    results: (test.results || []).map((r: any) => ({ ...r })),
  };
}

function toPayload(form: any) {
  return {
    title: form.title,
    slug: form.slug,
    description: form.description,
    resultType: form.resultType,
    isActive: !!form.isActive,
    questions: form.questions.map((q: any) => ({
      text: q.text,
      options: q.options.map((o: any) => ({
        text: o.text,
        scores: Object.fromEntries(
          (o.scoreRows || [])
            .filter((r: any) => String(r.key).trim())
            .map((r: any) => [String(r.key).trim(), Number(r.value) || 0])
        ),
      })),
    })),
    results: form.results.map((r: any) => ({
      key: r.key,
      title: r.title,
      description: r.description,
      recommendation: r.recommendation,
      minScore: r.minScore === "" || r.minScore === undefined ? undefined : Number(r.minScore),
      maxScore: r.maxScore === "" || r.maxScore === undefined ? undefined : Number(r.maxScore),
      ctaCourseSlug: r.ctaCourseSlug,
    })),
  };
}

export default function AdminTestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/tests");
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

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const setQuestion = (qi: number, patch: any) => {
    const questions = [...form.questions];
    questions[qi] = { ...questions[qi], ...patch };
    set("questions", questions);
  };

  const setOption = (qi: number, oi: number, patch: any) => {
    const questions = [...form.questions];
    const options = [...questions[qi].options];
    options[oi] = { ...options[oi], ...patch };
    questions[qi] = { ...questions[qi], options };
    set("questions", questions);
  };

  const setResult = (ri: number, patch: any) => {
    const results = [...form.results];
    results[ri] = { ...results[ri], ...patch };
    set("results", results);
  };

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      show("Başlık ve slug zorunludur", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editId) {
        await apiSend(`/api/admin/tests/${editId}`, "PUT", payload);
        show("Test güncellendi");
      } else {
        await apiSend("/api/admin/tests", "POST", payload);
        show("Test oluşturuldu");
      }
      setForm(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: any) => {
    try {
      await apiSend(`/api/admin/tests/${t._id}`, "PUT", { isActive: !t.isActive });
      setItems((prev) => prev.map((x) => (x._id === t._id ? { ...x, isActive: !t.isActive } : x)));
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const remove = async (t: any) => {
    if (!window.confirm(`"${t.title}" testini silmek istediğinize emin misiniz?`)) return;
    try {
      await apiSend(`/api/admin/tests/${t._id}`, "DELETE", {});
      show("Test silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        label="İçerik Yönetimi"
        title="Testler"
        action={
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm(toForm(emptyTest));
            }}
            className="btn-primary !px-4 !py-2 text-xs"
          >
            <Plus size={14} strokeWidth={1.5} /> Yeni Test
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Henüz test yok"
          description="Ziyaretçilerin çözebileceği kişilik ve bilgi testleri oluşturun."
          actionLabel="Yeni Test Ekle"
          onAction={() => {
            setEditId(null);
            setForm(toForm(emptyTest));
          }}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-4 font-medium text-text-secondary">Başlık</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Sonuç Tipi</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Soru Sayısı</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Aktif</th>
                <th className="px-6 py-4 text-right font-medium text-text-secondary">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((t) => (
                <tr key={t._id}>
                  <td className="px-6 py-4">
                    <p className="font-medium">{t.title}</p>
                    <p className="text-xs text-text-muted">/{t.slug}</p>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {RESULT_TYPES.find((r) => r.key === t.resultType)?.label || t.resultType}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{(t.questions || []).length}</td>
                  <td className="px-6 py-4">
                    <Toggle checked={!!t.isActive} onChange={() => toggleActive(t)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(t._id);
                          setForm(toForm(t));
                        }}
                        className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-elevated hover:text-accent"
                        aria-label="Düzenle"
                      >
                        <Pencil size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t)}
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
        <Modal title={editId ? "Testi Düzenle" : "Yeni Test"} onClose={() => setForm(null)} wide>
          <div className="space-y-6">
            {/* Meta */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlık" className="sm:col-span-2">
                <input
                  className="input-dark"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Slug">
                <div className="flex gap-2">
                  <input
                    className="input-dark"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
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
              <Field label="Sonuç Tipi">
                <select
                  className="input-dark"
                  value={form.resultType}
                  onChange={(e) => set("resultType", e.target.value)}
                >
                  {RESULT_TYPES.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Açıklama" className="sm:col-span-2">
                <textarea
                  className="input-dark min-h-[70px]"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>

            {/* Questions */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="micro-label">Sorular ({form.questions.length})</p>
                <button
                  type="button"
                  onClick={() =>
                    set("questions", [...form.questions, { text: "", options: [] }])
                  }
                  className="btn-ghost text-xs"
                >
                  <Plus size={14} strokeWidth={1.5} /> Soru Ekle
                </button>
              </div>
              <div className="space-y-4">
                {form.questions.map((q: any, qi: number) => (
                  <div key={qi} className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
                    <div className="flex items-start gap-2">
                      <span className="micro-label mt-3 shrink-0 !text-[0.6875rem]">S{qi + 1}</span>
                      <textarea
                        className="input-dark min-h-[44px] !py-2"
                        value={q.text}
                        onChange={(e) => setQuestion(qi, { text: e.target.value })}
                        placeholder="Soru metni"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          set("questions", form.questions.filter((_: any, x: number) => x !== qi))
                        }
                        className="mt-1 rounded-lg p-2 text-text-secondary hover:text-danger"
                        aria-label="Soruyu sil"
                      >
                        <Trash2 size={16} strokeWidth={1.5} />
                      </button>
                    </div>

                    {/* Options */}
                    <div className="mt-3 space-y-3 border-l border-border-subtle pl-4">
                      {q.options.map((o: any, oi: number) => (
                        <div key={oi} className="rounded-lg border border-border-subtle p-3">
                          <div className="flex items-center gap-2">
                            <input
                              className="input-dark !py-2"
                              value={o.text}
                              onChange={(e) => setOption(qi, oi, { text: e.target.value })}
                              placeholder={`Seçenek ${oi + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setQuestion(qi, {
                                  options: q.options.filter((_: any, x: number) => x !== oi),
                                })
                              }
                              className="rounded-lg p-1.5 text-text-secondary hover:text-danger"
                              aria-label="Seçeneği sil"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Scores */}
                          <div className="mt-2">
                            <p className="mb-1.5 text-[0.6875rem] uppercase tracking-[0.1em] text-text-muted">
                              Puanlar (sonuç anahtarı - değer)
                            </p>
                            <div className="space-y-1.5">
                              {(o.scoreRows || []).map((r: any, ri: number) => (
                                <div key={ri} className="flex items-center gap-2">
                                  <input
                                    className="input-dark !py-1.5 text-xs"
                                    value={r.key}
                                    onChange={(e) => {
                                      const rows = [...o.scoreRows];
                                      rows[ri] = { ...rows[ri], key: e.target.value };
                                      setOption(qi, oi, { scoreRows: rows });
                                    }}
                                    placeholder="Sonuç anahtarı"
                                  />
                                  <input
                                    type="number"
                                    className="input-dark w-24 shrink-0 !py-1.5 text-xs"
                                    value={r.value}
                                    onChange={(e) => {
                                      const rows = [...o.scoreRows];
                                      rows[ri] = { ...rows[ri], value: e.target.value };
                                      setOption(qi, oi, { scoreRows: rows });
                                    }}
                                    placeholder="Puan"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOption(qi, oi, {
                                        scoreRows: o.scoreRows.filter(
                                          (_: any, x: number) => x !== ri
                                        ),
                                      })
                                    }
                                    className="rounded-lg p-1.5 text-text-secondary hover:text-danger"
                                    aria-label="Puanı sil"
                                  >
                                    <Trash2 size={13} strokeWidth={1.5} />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setOption(qi, oi, {
                                  scoreRows: [...(o.scoreRows || []), { key: "", value: 1 }],
                                })
                              }
                              className="btn-ghost mt-1.5 text-xs"
                            >
                              <Plus size={12} strokeWidth={1.5} /> Puan Ekle
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setQuestion(qi, {
                            options: [...q.options, { text: "", scoreRows: [] }],
                          })
                        }
                        className="btn-ghost text-xs"
                      >
                        <Plus size={14} strokeWidth={1.5} /> Seçenek Ekle
                      </button>
                    </div>
                  </div>
                ))}
                {form.questions.length === 0 && (
                  <p className="text-xs text-text-muted">Henüz soru eklenmedi.</p>
                )}
              </div>
            </div>

            {/* Results */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="micro-label">Sonuçlar ({form.results.length})</p>
                <button
                  type="button"
                  onClick={() =>
                    set("results", [
                      ...form.results,
                      {
                        key: "",
                        title: "",
                        description: "",
                        recommendation: "",
                        minScore: "",
                        maxScore: "",
                        ctaCourseSlug: "",
                      },
                    ])
                  }
                  className="btn-ghost text-xs"
                >
                  <Plus size={14} strokeWidth={1.5} /> Sonuç Ekle
                </button>
              </div>
              <div className="space-y-4">
                {form.results.map((r: any, ri: number) => (
                  <div key={ri} className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="micro-label !text-[0.6875rem]">Sonuç {ri + 1}</span>
                      <button
                        type="button"
                        onClick={() =>
                          set("results", form.results.filter((_: any, x: number) => x !== ri))
                        }
                        className="rounded-lg p-1.5 text-text-secondary hover:text-danger"
                        aria-label="Sonucu sil"
                      >
                        <Trash2 size={15} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Anahtar (key)">
                        <input
                          className="input-dark !py-2"
                          value={r.key || ""}
                          onChange={(e) => setResult(ri, { key: e.target.value })}
                        />
                      </Field>
                      <Field label="Başlık">
                        <input
                          className="input-dark !py-2"
                          value={r.title || ""}
                          onChange={(e) => setResult(ri, { title: e.target.value })}
                        />
                      </Field>
                      <Field label="Açıklama" className="sm:col-span-2">
                        <textarea
                          className="input-dark min-h-[50px] !py-2"
                          value={r.description || ""}
                          onChange={(e) => setResult(ri, { description: e.target.value })}
                        />
                      </Field>
                      <Field label="Öneri" className="sm:col-span-2">
                        <textarea
                          className="input-dark min-h-[50px] !py-2"
                          value={r.recommendation || ""}
                          onChange={(e) => setResult(ri, { recommendation: e.target.value })}
                        />
                      </Field>
                      <Field label="Min Puan">
                        <input
                          type="number"
                          className="input-dark !py-2"
                          value={r.minScore ?? ""}
                          onChange={(e) => setResult(ri, { minScore: e.target.value })}
                        />
                      </Field>
                      <Field label="Max Puan">
                        <input
                          type="number"
                          className="input-dark !py-2"
                          value={r.maxScore ?? ""}
                          onChange={(e) => setResult(ri, { maxScore: e.target.value })}
                        />
                      </Field>
                      <Field label="Önerilen Eğitim (slug)" className="sm:col-span-2">
                        <input
                          className="input-dark !py-2"
                          value={r.ctaCourseSlug || ""}
                          onChange={(e) => setResult(ri, { ctaCourseSlug: e.target.value })}
                          placeholder="egitim-slug"
                        />
                      </Field>
                    </div>
                  </div>
                ))}
                {form.results.length === 0 && (
                  <p className="text-xs text-text-muted">Henüz sonuç tanımlanmadı.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border-subtle pt-5">
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
