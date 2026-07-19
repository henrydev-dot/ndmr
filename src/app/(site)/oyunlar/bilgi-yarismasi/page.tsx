import type { Metadata } from "next";
import QuizArena from "@/components/games/QuizArena";

export const metadata: Metadata = {
  title: "Bilgi Yarışması | NDMR",
  description:
    "Süre baskısı altında hipnoz sorularına yanıt verin, skor tablosunda yerinizi alın.",
};

export default function QuizPage() {
  return <QuizArena />;
}
