"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ImagePlus,
  Library,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { api, apiSend, uploadFile } from "@/components/admin/api";
import {
  EmptyState,
  Field,
  Loading,
  Modal,
  PageHeader,
  ToastView,
  useToast,
} from "@/components/admin/ui";

const CATEGORIES = ["Tarihçe", "Klinik", "Nöroloji", "NDMR"];

const emptyItem = {
  title: "",
  author: "",
  year: new Date().getFullYear(),
  category: "Tarihçe",
  abstract: "",
  fileUrl: "",
  externalUrl: "",
  images: [] as string[],
};

export default function AdminLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast, show } = useToast();

  const load = async () => {
    try {
      const d = await api("/api/admin/library");
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
    setForm({ ...emptyItem, images: [] });
  };

  const openEdit = (item: any) => {
    setEditId(item._id);
    setForm({ ...emptyItem, ...item, images: [...(item.images || [])] });
  };

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) {
      show("Başlık zorunludur", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, year: Number(form.year) || 0 };
      delete payload._id;
      if (editId) {
        await apiSend(`/api/admin/library/${editId}`, "PUT", payload);
        show("Kaynak güncellendi");
      } else {
        await apiSend("/api/admin/library", "POST", payload);
        show("Kaynak eklendi");
      }
      setForm(null);
      load();
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: any) => {
    if (!window.confirm(`"${item.title}" kaynağını silmek istediğinize emin misiniz?`)) return;
    try {
      await apiSend(`/api/admin/library/${item._id}`, "DELETE", {});
      show("Kaynak silindi");
      load();
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const url = await uploadFile(file);
      set("fileUrl", url);
      show("PDF yüklendi");
    } catch (err: any) {
      show(err.message, "error");
    } finally {
      setUploadingPdf(false);
      e.target.value = "";
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setForm((f: any) => ({ ...f, images: [...f.images, url] }));
      show("Görsel yüklendi");
    } catch (err: any) {
      show(err.message, "error");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <PageHeader
        label="İçerik Yönetimi"
        title="Kütüphane"
        action={
          <button type="button" onClick={openCreate} className="btn-primary !px-4 !py-2 text-xs">
            <Plus size={14} strokeWidth={1.5} /> Yeni Kaynak
          </button>
        }
      />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Library}
          title="Kütüphane boş"
          description="Makale, kitap ve araştırma kaynaklarını ekleyerek kütüphaneyi oluşturun."
          actionLabel="Yeni Kaynak Ekle"
          onAction={openCreate}
        />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="px-6 py-4 font-medium text-text-secondary">Başlık</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Yazar</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Yıl</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Kategori</th>
                <th className="px-6 py-4 font-medium text-text-secondary">Dosya</th>
                <th className="px-6 py-4 text-right font-medium text-text-secondary">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="max-w-[280px] px-6 py-4">
                    <p className="truncate font-medium">{item.title}</p>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">{item.author || "-"}</td>
                  <td className="px-6 py-4 text-text-secondary">{item.year || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-pill bg-accent/10 px-2.5 py-1 text-[0.6875rem] text-accent">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs"
                      >
                        <FileText size={14} strokeWidth={1.5} /> PDF
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted">-</span>
                    )}
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

      {form && (
        <Modal title={editId ? "Kaynağı Düzenle" : "Yeni Kaynak"} onClose={() => setForm(null)} wide>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Başlık" className="sm:col-span-2">
                <input
                  className="input-dark"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Yazar">
                <input
                  className="input-dark"
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </Field>
              <Field label="Yıl">
                <input
                  type="number"
                  className="input-dark"
                  value={form.year}
                  onChange={(e) => set("year", e.target.value)}
                />
              </Field>
              <Field label="Kategori">
                <select
                  className="input-dark"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Harici Bağlantı (URL)">
                <input
                  className="input-dark"
                  value={form.externalUrl}
                  onChange={(e) => set("externalUrl", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
              <Field label="Özet" className="sm:col-span-2">
                <textarea
                  className="input-dark min-h-[90px]"
                  value={form.abstract}
                  onChange={(e) => set("abstract", e.target.value)}
                />
              </Field>
            </div>

            {/* PDF */}
            <div>
              <p className="micro-label mb-3">PDF Dosyası</p>
              <div className="flex flex-wrap items-center gap-3">
                <label className="btn-secondary cursor-pointer !px-3 !py-1.5 text-xs">
                  {uploadingPdf ? (
                    <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <FileText size={14} strokeWidth={1.5} />
                  )}
                  {uploadingPdf ? "Yükleniyor..." : "PDF Yükle"}
                  <input type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                </label>
                {form.fileUrl && (
                  <>
                    <a
                      href={form.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="max-w-[240px] truncate text-xs text-accent underline"
                    >
                      {form.fileUrl}
                    </a>
                    <button
                      type="button"
                      onClick={() => set("fileUrl", "")}
                      className="btn-ghost text-xs text-danger hover:text-danger"
                    >
                      Kaldır
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Images */}
            <div>
              <p className="micro-label mb-3">Görseller</p>
              <div className="flex flex-wrap items-center gap-3">
                {form.images.map((url: string, i: number) => (
                  <div key={`${url}-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Görsel ${i + 1}`}
                      className="h-16 w-24 rounded-xl border border-border-subtle object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set("images", form.images.filter((_: any, x: number) => x !== i))
                      }
                      className="absolute -right-2 -top-2 rounded-full border border-border-subtle bg-surface-elevated p-1 text-text-secondary hover:text-danger"
                      aria-label="Görseli kaldır"
                    >
                      <X size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                ))}
                <label className="btn-secondary cursor-pointer !px-3 !py-1.5 text-xs">
                  {uploadingImage ? (
                    <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                  ) : (
                    <ImagePlus size={14} strokeWidth={1.5} />
                  )}
                  {uploadingImage ? "Yükleniyor..." : "Görsel Ekle"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
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
