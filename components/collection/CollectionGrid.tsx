"use client";

import { Car } from "@/lib/types/car";
import CarCard from "./CarCard";
import { SearchX, RotateCcw } from "lucide-react";

interface CollectionGridProps {
  cars: Car[];
  onResetFilters: () => void;
}

export default function CollectionGrid({ cars, onResetFilters }: CollectionGridProps) {
  if (cars.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-12 text-center space-y-4 my-8">
        <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center mx-auto text-zinc-400">
          <SearchX className="w-6 h-6 text-rose-500" />
        </div>
        <h3 className="text-lg font-bold text-white">No Replicas Found</h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto">
          No model cars match your active criteria. Try clearing search keywords or selecting different filter options.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
