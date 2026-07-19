import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Giriş / Kayıt",
  description: "Hesabınıza giriş yapın veya yeni hesap oluşturun.",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-20">
      <AuthForm />
    </div>
  );
}
