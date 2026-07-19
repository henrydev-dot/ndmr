"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="btn-secondary !px-4 !py-2 text-xs"
    >
      <LogOut size={14} strokeWidth={1.5} /> Çıkış Yap
    </button>
  );
}
