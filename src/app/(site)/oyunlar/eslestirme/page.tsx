import type { Metadata } from "next";
import MatchingGame from "@/components/games/MatchingGame";

export const metadata: Metadata = {
  title: "Eşleştirme Oyunu | NDMR",
  description:
    "Hipnoz terimlerini doğru tanımlarla eşleştirin. Süreye ve hamle sayınıza karşı yarışın.",
};

export default function MatchingPage() {
  return <MatchingGame />;
}
