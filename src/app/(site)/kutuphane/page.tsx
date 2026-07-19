import LibraryBrowser from "@/components/LibraryBrowser";

export const metadata = {
  title: "Akademik Arşiv Kütüphanesi",
  description:
    "Hipnoz tarihçesi, klinik uygulamalar, nöroloji ve NDMR üzerine akademik makale ve arşiv kayıtları.",
};

export default function LibraryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="micro-label mb-4">Akademik Arşiv</p>
      <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
        Kütüphane
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-text-secondary">
        Hipnozun antik köklerinden modern nörobilim araştırmalarına uzanan akademik kayıtlar ve
        görsel arşiv.
      </p>
      <LibraryBrowser />
    </div>
  );
}
