import type { Metadata } from "next";
import MemoryGame from "@/components/games/MemoryGame";

export const metadata: Metadata = {
  title: "Hafıza Oyunu | NDMR",
  description:
    "Kart çiftlerini bularak hipnoz kavramlarını görsel hafızanıza kazıyın.",
};

export default function MemoryPage() {
  return <MemoryGame />;
}
