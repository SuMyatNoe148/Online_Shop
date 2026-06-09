import AdminSidebar from "@/presentation/components/admin/AdminSidebar";

export const metadata = { title: "Admin" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ab-admin">
      <AdminSidebar />
      <main className="ab-admin__main">{children}</main>
    </div>
  );
}
