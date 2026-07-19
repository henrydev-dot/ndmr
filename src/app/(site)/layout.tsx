import { getSiteSettings } from "@/lib/settings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <Navbar settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton
        number={settings.contact.whatsappNumber}
        template={settings.contact.whatsappTemplate}
      />
    </>
  );
}
