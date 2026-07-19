import type { Metadata } from "next";
import WordGame from "@/components/games/WordGame";

export const metadata: Metadata = {
  title: "Kelime Tamamlama | NDMR",
  description:
    "İpuçlarından yola çıkarak eksik harfleri tamamlayın, hipnoz terminolojinizi güçlendirin.",
};

export default function WordPage() {
  return <WordGame />;
}
