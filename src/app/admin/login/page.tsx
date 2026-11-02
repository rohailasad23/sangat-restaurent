import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="display text-center text-4xl tracking-[0.2em]">SANGAT</p>
        <p className="eyebrow mt-3 text-center">Restaurant admin</p>
        <div className="mt-10 border border-line bg-coal p-8"><LoginForm /></div>
      </div>
    </main>
  );
}
