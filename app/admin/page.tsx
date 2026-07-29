import AdminDashboard from "@/components/admin/AdminDashboard";
import { getCars } from "@/lib/actions/car-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Inventory Management",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const cars = await getCars();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <AdminDashboard cars={cars} />
    </div>
  );
}
