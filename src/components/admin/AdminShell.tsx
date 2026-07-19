"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  CalendarCheck,
  ClipboardList,
  Clock,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  Menu,
  Settings,
  StickyNote,
  WalletCards,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/egitimler", label: "Eğitimler", icon: GraduationCap },
  { href: "/admin/randevular", label: "Randevular", icon: CalendarCheck },
  { href: "/admin/musaitlik", label: "Müsaitlik", icon: Clock },
  { href: "/admin/kartlar", label: "Öğrenme Kartları", icon: WalletCards },
  { href: "/admin/oyunlar", label: "Oyun İçerikleri", icon: Gamepad2 },
  { href: "/admin/kutuphane", label: "Kütüphane", icon: Library },
  { href: "/admin/testler", label: "Testler", icon: ClipboardList },
  { href: "/admin/notlar", label: "Notlar", icon: StickyNote },
  { href: "/admin/mesajlar", label: "İletişim Mesajları", icon: Mail },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/giris") {
    return <>{children}</>;
  }

  const current = NAV.find((n) =>
    n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
  );

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/giris";
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-border-subtle bg-bg-secondary transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-5">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <BrainCircuit size={20} strokeWidth={1.5} />
            </span>
            <span>
              <span className="block font-heading text-sm font-medium leading-tight">NDMR Hipnoz</span>
              <span className="block text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                Yönetim Paneli
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="text-text-secondary lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                }`}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border-subtle p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-surface-elevated hover:text-danger"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Çıkış
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border-subtle bg-bg-primary/90 px-4 py-3 backdrop-blur sm:px-6">
          <button
            type="button"
            className="text-text-secondary lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium text-text-secondary">
            {current ? current.label : "Yönetim"}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
              <ExternalLink size={14} strokeWidth={1.5} />
              Siteyi Görüntüle
            </a>
            <button type="button" onClick={logout} className="btn-secondary !px-3 !py-1.5 text-xs">
              <LogOut size={14} strokeWidth={1.5} />
              Çıkış
            </button>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
