"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { api, apiSend, uploadFile } from "@/components/admin/api";
import {
  Field,
  Loading,
  PageHeader,
  ToastView,
  Toggle,
  useToast,
} from "@/components/admin/ui";

const PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X (Twitter)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
];

export default function AdminSettingsPage() {
  const [s, setS] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { toast, show } = useToast();

  useEffect(() => {
    api("/api/admin/settings")
      .then((d) => {
        const doc = d.item || d;
        setS({
          siteTitle: "",
          siteDescription: "",
          logoUrl: "",
          heroTitleLine1: "",
          heroTitleLine2: "",
          heroSubtitle: "",
          ...doc,
          announcement: { text: "", isActive: false, ...(doc.announcement || {}) },
          contact: {
            phone: "",
            email: "",
            address: "",
            mapEmbedUrl: "",
            whatsappNumber: "",
            whatsappTemplate: "",
            ...(doc.contact || {}),
          },
          socials: (doc.socials || []).map((x: any) => ({ ...x })),
        });
      })
      .catch((e: any) => show(e.message, "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key: string, value: any) => setS((prev: any) => ({ ...prev, [key]: value }));
  const setContact = (key: string, value: any) =>
    setS((prev: any) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
  const setAnnouncement = (key: string, value: any) =>
    setS((prev: any) => ({ ...prev, announcement: { ...prev.announcement, [key]: value } }));
  const setSocial = (i: number, patch: any) =>
    setS((prev: any) => {
      const socials = [...prev.socials];
      socials[i] = { ...socials[i], ...patch };
      return { ...prev, socials };
    });

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadFile(file);
      set("logoUrl", url);
      show("Logo yüklendi");
    } catch (err: any) {
      show(err.message, "error");
    } finally {
      setUploadingLogo(false);
      e.target.value = "";
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...s,
        socials: s.socials.map((x: any, i: number) => ({
          platform: x.platform,
          url: x.url,
          isActive: !!x.isActive,
          order: x.order === "" || x.order === undefined ? i : Number(x.order),
        })),
      };
      delete payload._id;
      await apiSend("/api/admin/settings", "PUT", payload);
      show("Site ayarları kaydedildi");
    } catch (e: any) {
      show(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !s) {
    return (
      <div>
        <PageHeader label="Yapılandırma" title="Site Ayarları" />
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        label="Yapılandırma"
        title="Site Ayarları"
        action={
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary !px-4 !py-2 text-xs disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
            ) : (
              <Save size={14} strokeWidth={1.5} />
            )}
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* General */}
        <div className="card space-y-4 p-6">
          <p className="micro-label">Genel</p>
          <Field label="Site Başlığı">
            <input
              className="input-dark"
              value={s.siteTitle || ""}
              onChange={(e) => set("siteTitle", e.target.value)}
            />
          </Field>
          <Field label="Site Açıklaması">
            <textarea
              className="input-dark min-h-[70px]"
              value={s.siteDescription || ""}
              onChange={(e) => set("siteDescription", e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-1.5 text-xs font-medium text-text-secondary">Logo</p>
            <div className="flex items-center gap-4">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logoUrl}
                  alt="Logo"
                  className="h-14 w-14 rounded-xl border border-border-subtle bg-bg-secondary object-contain p-1"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-border-subtle text-text-muted">
                  <ImagePlus size={18} strokeWidth={1.5} />
                </div>
              )}
              <label className="btn-secondary cursor-pointer !px-3 !py-1.5 text-xs">
                {uploadingLogo ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <ImagePlus size={14} strokeWidth={1.5} />
                )}
                {uploadingLogo ? "Yükleniyor..." : "Logo Yükle"}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </label>
              {s.logoUrl && (
                <button
                  type="button"
                  onClick={() => set("logoUrl", "")}
                  className="btn-ghost text-xs text-danger hover:text-danger"
                >
                  Kaldır
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="card space-y-4 p-6">
          <p className="micro-label">Ana Sayfa (Hero)</p>
          <Field label="Başlık Satır 1">
            <input
              className="input-dark"
              value={s.heroTitleLine1 || ""}
              onChange={(e) => set("heroTitleLine1", e.target.value)}
            />
          </Field>
          <Field label="Başlık Satır 2">
            <input
              className="input-dark"
              value={s.heroTitleLine2 || ""}
              onChange={(e) => set("heroTitleLine2", e.target.value)}
            />
          </Field>
          <Field label="Alt Başlık">
            <textarea
              className="input-dark min-h-[70px]"
              value={s.heroSubtitle || ""}
              onChange={(e) => set("heroSubtitle", e.target.value)}
            />
          </Field>
        </div>

        {/* Announcement */}
        <div className="card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <p className="micro-label">Duyuru</p>
            <label className="flex items-center gap-2 text-xs text-text-secondary">
              Aktif
              <Toggle
                checked={!!s.announcement.isActive}
                onChange={(v) => setAnnouncement("isActive", v)}
              />
            </label>
          </div>
          <Field label="Duyuru Metni">
            <textarea
              className="input-dark min-h-[70px]"
              value={s.announcement.text || ""}
              onChange={(e) => setAnnouncement("text", e.target.value)}
            />
          </Field>
        </div>

        {/* Contact */}
        <div className="card space-y-4 p-6">
          <p className="micro-label">İletişim</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon">
              <input
                className="input-dark"
                value={s.contact.phone || ""}
                onChange={(e) => setContact("phone", e.target.value)}
              />
            </Field>
            <Field label="E-posta">
              <input
                className="input-dark"
                value={s.contact.email || ""}
                onChange={(e) => setContact("email", e.target.value)}
              />
            </Field>
            <Field label="Adres" className="sm:col-span-2">
              <textarea
                className="input-dark min-h-[60px]"
                value={s.contact.address || ""}
                onChange={(e) => setContact("address", e.target.value)}
              />
            </Field>
            <Field label="Harita Embed URL" className="sm:col-span-2">
              <input
                className="input-dark"
                value={s.contact.mapEmbedUrl || ""}
                onChange={(e) => setContact("mapEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
              />
            </Field>
            <Field label="WhatsApp Numarası">
              <input
                className="input-dark"
                value={s.contact.whatsappNumber || ""}
                onChange={(e) => setContact("whatsappNumber", e.target.value)}
                placeholder="905xxxxxxxxx"
              />
            </Field>
            <Field label="WhatsApp Mesaj Şablonu">
              <input
                className="input-dark"
                value={s.contact.whatsappTemplate || ""}
                onChange={(e) => setContact("whatsappTemplate", e.target.value)}
                placeholder="Merhaba, bilgi almak istiyorum."
              />
            </Field>
          </div>
        </div>

        {/* Socials */}
        <div className="card p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="micro-label">Sosyal Medya</p>
            <button
              type="button"
              onClick={() =>
                set("socials", [
                  ...s.socials,
                  { platform: "instagram", url: "", isActive: true, order: s.socials.length },
                ])
              }
              className="btn-ghost text-xs"
            >
              <Plus size={14} strokeWidth={1.5} /> Hesap Ekle
            </button>
          </div>

          {s.socials.length === 0 ? (
            <p className="text-xs text-text-muted">Henüz sosyal medya hesabı eklenmedi.</p>
          ) : (
            <div className="space-y-3">
              {s.socials.map((x: any, i: number) => (
                <div key={i} className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-3">
                  <select
                    className="input-dark w-40 !py-2"
                    value={x.platform}
                    onChange={(e) => setSocial(i, { platform: e.target.value })}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input-dark min-w-[200px] flex-1 !py-2"
                    value={x.url || ""}
                    onChange={(e) => setSocial(i, { url: e.target.value })}
                    placeholder="https://..."
                  />
                  <input
                    type="number"
                    className="input-dark w-20 !py-2"
                    value={x.order ?? i}
                    onChange={(e) => setSocial(i, { order: e.target.value })}
                    title="Sıra"
                  />
                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    Aktif
                    <Toggle checked={!!x.isActive} onChange={(v) => setSocial(i, { isActive: v })} />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      set("socials", s.socials.filter((_: any, idx: number) => idx !== i))
                    }
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:text-danger"
                    aria-label="Kaldır"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-primary !px-5 !py-2.5 text-xs disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Save size={14} strokeWidth={1.5} />
          )}
          {saving ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
        </button>
      </div>

      <ToastView toast={toast} />
    </div>
  );
}
