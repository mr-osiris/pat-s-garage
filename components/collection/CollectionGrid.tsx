"use client";

import { useState, useEffect, useRef } from "react";
import { Car } from "@/lib/types/car";
import CarCard from "./CarCard";
import { SearchX, RotateCcw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface CollectionGridProps {
  cars: Car[];
  onResetFilters: () => void;
  desktopCols?: 3 | 4;
  mobileCols?: 1 | 2 | 3 | 4;
  perPage?: number;
}

// Map column counts to responsive Tailwind grid classes
// We use fixed class strings so Tailwind can detect them at build time
const desktopGridClass: Record<3 | 4, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

const mobileGridClass: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

export default function CollectionGrid({
  cars,
  onResetFilters,
  desktopCols = 3,
  mobileCols = 1,
  perPage = 12,
}: CollectionGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const prevCarsLenRef = useRef(cars.length);

  const totalPages = Math.max(1, Math.ceil(cars.length / perPage));

  // Reset to page 1 when the filtered car list changes
  useEffect(() => {
    if (cars.length !== prevCarsLenRef.current) {
      setCurrentPage(1);
      prevCarsLenRef.current = cars.length;
    }
  }, [cars.length]);

  // Clamp current page if it exceeds total pages (e.g. after filter)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIdx = (currentPage - 1) * perPage;
  const paginatedCars = cars.slice(startIdx, startIdx + perPage);

  const gridClasses = `grid ${mobileGridClass[mobileCols]} sm:grid-cols-2 ${desktopGridClass[desktopCols]} gap-4 sm:gap-6`;

  const goToPage = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(clamped);
    // Smooth scroll to top of grid
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Build visible page numbers (show max 5 around current)
  const getVisiblePages = (): number[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    // Adjust window to always show 3 middle pages
    if (start === 2) end = Math.min(totalPages - 1, 4);
    if (end === totalPages - 1) start = Math.max(2, totalPages - 3);

    if (start > 2) pages.push(-1); // ellipsis
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push(-2); // ellipsis

    pages.push(totalPages);
    return pages;
  };

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
    <div ref={gridRef} className="space-y-6">
      {/* Grid */}
      <div className={gridClasses}>
        {paginatedCars.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Page info */}
          <p className="text-xs font-mono text-zinc-500 order-2 sm:order-1">
            Showing{" "}
            <span className="text-zinc-300 font-bold">{startIdx + 1}</span>
            –
            <span className="text-zinc-300 font-bold">
              {Math.min(startIdx + perPage, cars.length)}
            </span>{" "}
            of <span className="text-zinc-300 font-bold">{cars.length}</span>
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1 order-1 sm:order-2">
            {/* First */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page numbers */}
            {getVisiblePages().map((page, idx) =>
              page < 0 ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-zinc-600 text-xs font-mono select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`min-w-[32px] h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    page === currentPage
                      ? "bg-rose-600 text-white border border-rose-500 shadow-md shadow-rose-950/40"
                      : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
