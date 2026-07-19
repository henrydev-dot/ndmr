"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

const NAV_LINKS = [
  { href: "/egitimler", label: "Eğitimler" },
  { href: "/ogrenme-kartlari", label: "Kartlar" },
  { href: "/oyunlar", label: "Oyunlar" },
  { href: "/kutuphane", label: "Kütüphane" },
  { href: "/testler", label: "Testler" },
  { href: "/notlar", label: "Notlar" },
  { href: "/hakkinda", label: "Hakkında" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {settings.announcement?.isActive && settings.announcement.text && (
        <div className="bg-accent-deep/40 border-b border-border-subtle px-4 py-2 text-center text-xs text-text-secondary">
          {settings.announcement.text}
        </div>
      )}
      <header className="sticky top-0 z-50 px-4 pt-4">
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-pill border px-5 py-3 transition-all duration-300 ${
            scrolled
              ? "border-border-subtle bg-bg-primary/80 backdrop-blur-xl"
              : "border-border-subtle/50 bg-bg-primary/40 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="font-heading text-lg font-medium tracking-tight text-text-primary">
            Gökhan Işık
            <span className="ml-2 hidden text-xs font-normal uppercase tracking-[0.14em] text-text-muted sm:inline">
              NDMR
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-pill px-3 py-1.5 text-sm transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-accent-secondary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/giris" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Giriş
            </Link>
            <Link href="/randevu" className="btn-secondary !px-4 !py-2 text-xs uppercase tracking-wider">
              Randevu Oluştur
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-text-secondary lg:hidden"
            aria-label="Menüyü aç"
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col bg-bg-primary/97 px-8 pt-28 backdrop-blur-2xl lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-border-subtle py-4 font-heading text-2xl font-light text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/randevu" className="btn-primary justify-center">
              Randevu Oluştur <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
            <Link href="/giris" className="btn-secondary justify-center">
              Giriş Yap
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
