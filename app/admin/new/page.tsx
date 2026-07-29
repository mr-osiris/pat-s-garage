import CarForm from "@/components/admin/CarForm";
import { createCar } from "@/lib/actions/car-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Replica | Admin Vault",
};

export default function NewCarPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <CarForm onSubmitAction={createCar} isEditing={false} />
    </div>
  );
}
