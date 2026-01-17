import Sidebar from "@/app/components/sidebar/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar />
      <div className="flex-1 bg-gray-900 overflow-auto">
        {children}
      </div>
    </div>
  );
}