import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="micro-label mb-4">Hata 404</p>
      <h1 className="font-heading text-4xl font-light text-text-primary">Sayfa bulunamadı</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-text-secondary">
        Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link href="/" className="btn-secondary mt-8">
        <ArrowLeft size={15} strokeWidth={1.5} /> Ana Sayfaya Dön
      </Link>
    </div>
  );
}
