import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle.split("|")[0].trim()}`,
    },
    description: settings.siteDescription,
    openGraph: {
      title: settings.siteTitle,
      description: settings.siteDescription,
      type: "website",
      locale: "tr_TR",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
