import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin().catch(() => null);
  if (!admin) redirect("/admin/login");
  return (
    <div className="md:flex">
      <AdminNav email={admin.email} />
      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}
