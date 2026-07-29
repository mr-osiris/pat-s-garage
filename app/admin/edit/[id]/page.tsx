import { notFound } from "next/navigation";
import CarForm from "@/components/admin/CarForm";
import { getCarById, updateCar } from "@/lib/actions/car-actions";
import { CarFormValues } from "@/lib/schemas/car-schema";
import type { Metadata } from "next";

interface EditCarPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditCarPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
  return {
    title: car ? `Edit ${car.name} | Admin Vault` : "Edit Car",
  };
}

export default async function EditCarPage({ params }: EditCarPageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  const handleUpdate = async (values: CarFormValues) => {
    "use server";
    return await updateCar(id, values);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <CarForm initialCar={car} onSubmitAction={handleUpdate} isEditing={true} />
    </div>
  );
}
