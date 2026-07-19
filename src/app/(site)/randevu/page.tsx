import AppointmentWizard from "@/components/AppointmentWizard";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Randevu Oluştur",
  description:
    "Bireysel seans, eğitim danışmanlığı veya kurumsal eğitim için uygun tarih ve saati seçerek randevu oluşturun.",
};

export default async function AppointmentPage() {
  const settings = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="micro-label mb-4">Randevu Sistemi</p>
      <h1 className="font-heading text-4xl font-light tracking-tight text-text-primary md:text-5xl">
        Randevu Oluştur
      </h1>
      <p className="mt-4 leading-relaxed text-text-secondary">
        Üç adımda randevunuzu planlayın: hizmet seçin, uygun tarih ve saati belirleyin, iletişim
        bilgilerinizi bırakın.
      </p>
      <AppointmentWizard
        whatsappNumber={settings.contact.whatsappNumber}
        whatsappTemplate={settings.contact.whatsappTemplate}
      />
    </div>
  );
}
