import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";
import SocialIcons from "./SocialIcons";

const QUICK_LINKS = [
  { href: "/egitimler", label: "Eğitim Paketleri" },
  { href: "/ogrenme-kartlari", label: "Öğrenme Kartları" },
  { href: "/oyunlar", label: "Öğrenme Oyunları" },
  { href: "/kutuphane", label: "Akademik Kütüphane" },
  { href: "/testler", label: "Psikolojik Testler" },
  { href: "/randevu", label: "Randevu Oluştur" },
];

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-border-subtle bg-bg-secondary">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-3">
        <div>
          <p className="font-heading text-xl font-medium text-text-primary">Gökhan Işık</p>
          <p className="micro-label mt-1">NDMR Antik Hipnoz Eğitimi</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
            Antik telkin geleneklerini modern bilinçaltı çalışmalarıyla birleştiren özgün bir
            zihinsel dönüşüm metodolojisi.
          </p>
        </div>
        <div>
          <p className="micro-label mb-5">Hızlı Bağlantılar</p>
          <ul className="space-y-3">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-text-secondary transition-colors hover:text-accent-secondary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="micro-label mb-5">İletişim</p>
          <ul className="space-y-3 text-sm text-text-secondary">
            {settings.contact.phone && (
              <li className="flex items-center gap-3">
                <Phone size={16} strokeWidth={1.5} className="text-text-muted" />
                {settings.contact.phone}
              </li>
            )}
            {settings.contact.email && (
              <li className="flex items-center gap-3">
                <Mail size={16} strokeWidth={1.5} className="text-text-muted" />
                {settings.contact.email}
              </li>
            )}
            {settings.contact.address && (
              <li className="flex items-start gap-3">
                <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0 text-text-muted" />
                {settings.contact.address}
              </li>
            )}
          </ul>
          <div className="mt-6">
            <SocialIcons socials={settings.socials} />
          </div>
        </div>
      </div>
      <div className="border-t border-border-subtle px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Gökhan Işık — NDMR Antik Hipnoz Eğitimi. Tüm hakları saklıdır.
          </p>
          <p className="max-w-md text-xs leading-relaxed text-text-muted">
            İçerikler eğitim ve farkındalık amaçlıdır; tıbbi veya psikolojik tedavi yerine geçmez.
          </p>
        </div>
      </div>
    </footer>
  );
}
