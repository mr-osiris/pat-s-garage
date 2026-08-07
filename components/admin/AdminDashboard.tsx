"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car } from "@/lib/types/car";
import DeleteModal from "./DeleteModal";
import { Plus, Search, Edit2, Trash2, LogOut, ShieldCheck, ExternalLink, Flame, Wand2 } from "lucide-react";
import { softDeleteCar, normalizeBrandsAndManufacturers } from "@/lib/actions/car-actions";

interface AdminDashboardProps {
  cars: Car[];
}

export default function AdminDashboard({ cars }: AdminDashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCarToDelete, setSelectedCarToDelete] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [normalizeResult, setNormalizeResult] = useState<string | null>(null);



  const filteredCars = cars.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = async () => {
    // Clear custom admin session cookie
    document.cookie = "vault_admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Also sign out from Supabase if it is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co") {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    }

    router.push("/login");
    router.refresh();
  };

  const handleConfirmDelete = async () => {
    if (!selectedCarToDelete) return;
    setIsDeleting(true);
    await softDeleteCar(selectedCarToDelete.id);
    setIsDeleting(false);
    setSelectedCarToDelete(null);
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Admin Management Vault</h1>
            <p className="text-xs text-zinc-400 font-mono">
              Authenticated Collection Control • {cars.length} Total Inventory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Showroom
          </Link>
          <Link
            href="/admin/new"
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Car
          </Link>
          <button
            onClick={async () => {
              setIsNormalizing(true);
              setNormalizeResult(null);
              const res = await normalizeBrandsAndManufacturers();
              setIsNormalizing(false);
              if (res.success) {
                const total = res.brandsFixed + res.manufacturersFixed;
                setNormalizeResult(
                  total === 0
                    ? "No duplicates found — all clean!"
                    : `Fixed ${res.brandsFixed} brand(s) and ${res.manufacturersFixed} manufacturer(s).`
                );
                if (total > 0) window.location.reload();
              } else {
                setNormalizeResult(`Error: ${res.error}`);
              }
            }}
            disabled={isNormalizing}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Fix duplicate brand/manufacturer entries caused by different casing"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {isNormalizing ? "Fixing..." : "Fix Duplicates"}
          </button>
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
            title="Log Out Admin Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {normalizeResult && (
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-mono flex items-center justify-between">
          <span>{normalizeResult}</span>
          <button onClick={() => setNormalizeResult(null)} className="text-amber-500 hover:text-amber-300 ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* Admin Quick Search & Bar */}
      <div className="flex items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search inventory by car name, brand..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Showing <span className="text-white font-bold">{filteredCars.length}</span> models
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 uppercase">
              <tr>
                <th className="py-4 px-6">Model</th>
                <th className="py-4 px-6">Brand</th>
                <th className="py-4 px-6">Manufacturer</th>
                <th className="py-4 px-6">Scale</th>
                <th className="py-4 px-6">Year</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredCars.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 font-sans">
                    No models found in inventory.
                  </td>
                </tr>
              ) : (
                filteredCars.map((car) => (
                  <tr key={car.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0 border border-zinc-800">
                          <Image src={car.cover_image} alt={car.name} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-white font-sans text-sm line-clamp-1">
                          {car.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-rose-400 font-semibold">{car.brand}</td>
                    <td className="py-3 px-6 text-zinc-300">{car.manufacturer}</td>
                    <td className="py-3 px-6 text-zinc-300 font-bold">{car.scale}</td>
                    <td className="py-3 px-6 text-zinc-400">{car.year}</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/edit/${car.id}`}
                          className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:border-rose-500/50 transition-colors"
                          title="Edit Replica"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setSelectedCarToDelete(car)}
                          className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors cursor-pointer"
                          title="Soft Delete Replica"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedCarToDelete && (
        <DeleteModal
          isOpen={!!selectedCarToDelete}
          carName={selectedCarToDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelectedCarToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
