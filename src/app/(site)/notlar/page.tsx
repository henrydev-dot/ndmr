import GuestWall from "@/components/GuestWall";

export const metadata = {
  title: "Ziyaretçi Defteri",
  description: "Ziyaretçilerin deneyimlerini ve düşüncelerini paylaştığı not duvarı.",
};

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="micro-label mb-4">Ziyaretçi Defteri</p>
      <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
        Notlar
      </h1>
      <p className="mt-4 leading-relaxed text-text-secondary">
        Düşüncelerinizi, deneyimlerinizi veya sorularınızı buraya bırakabilirsiniz. Mesajlar
        moderasyon sonrası yayınlanır.
      </p>
      <GuestWall />
    </div>
  );
}
