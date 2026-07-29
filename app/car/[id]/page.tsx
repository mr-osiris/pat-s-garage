import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import CarDetailView from "@/components/car-detail/CarDetailView";
import { getCarById } from "@/lib/actions/car-actions";
import type { Metadata } from "next";

interface CarPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CarPageProps): Promise<Metadata> {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) {
    return {
      title: "Model Not Found",
    };
  }

  return {
    title: `${car.name} (${car.scale}) - ${car.brand}`,
    description: car.description || `${car.name} precision ${car.scale} scale die-cast replica by ${car.manufacturer}.`,
    openGraph: {
      title: `${car.name} - DieCast Vault`,
      images: [{ url: car.cover_image }],
    },
  };
}

export default async function CarDetailPage({ params }: CarPageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="pt-20">
          <CarDetailView car={car} />
        </main>
      </div>
      <Footer />
    </div>
  );
}
