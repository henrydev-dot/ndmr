import type { Metadata } from "next";
import FlashcardsApp from "@/components/flashcards/FlashcardsApp";

export const metadata: Metadata = {
  title: "Öğrenme Kartları | NDMR",
  description:
    "Hipnoz eğitimi kavramlarını çift yüzlü öğrenme kartlarıyla tekrar edin ve ilerlemenizi takip edin.",
};

export default function FlashcardsPage() {
  return <FlashcardsApp />;
}
