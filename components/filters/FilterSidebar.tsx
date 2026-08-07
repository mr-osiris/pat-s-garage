"use client";

import { Search, RotateCcw, Filter, Car, Scale, Factory, LayoutGrid, Monitor, Smartphone, Hash } from "lucide-react";
import { FilterState, GridLayout } from "@/lib/types/car";

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  activeCount: number;
  totalCount: number;
  brands: string[];
  manufacturers: string[];
  scales: string[];
  gridLayout: GridLayout;
  onGridLayoutChange: (newLayout: Partial<GridLayout>) => void;
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  activeCount,
  totalCount,
  brands,
  manufacturers,
  scales,
  gridLayout,
  onGridLayoutChange,
}: FilterSidebarProps) {
  const isFiltered =
    filters.search !== "" ||
    filters.brand !== "all" ||
    filters.manufacturer !== "all" ||
    filters.scale !== "all";

  return (
    <aside className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 backdrop-blur-sm sticky top-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Filter Vault
          </h2>
        </div>
        {isFiltered && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-mono transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Instant Search Bar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block font-mono">
          Search Model
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search Porsche, R34, GT3..."
            className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Brand Select — dynamic from collection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Car className="w-3.5 h-3.5 text-rose-500" />
          Brand
        </label>
        <select
          value={filters.brand}
          onChange={(e) => onFilterChange({ brand: e.target.value })}
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500/60 transition-colors cursor-pointer"
        >
          <option value="all">All Brands ({totalCount})</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Scale Filter Pills — dynamic from collection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Scale className="w-3.5 h-3.5 text-rose-500" />
          Scale Spectrum
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange({ scale: "all" })}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
              filters.scale === "all"
                ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                : "bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            All
          </button>
          {scales.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange({ scale: s })}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer ${
                filters.scale === s
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                  : "bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Manufacturer Select — dynamic from collection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Factory className="w-3.5 h-3.5 text-rose-500" />
          Manufacturer
        </label>
        <select
          value={filters.manufacturer}
          onChange={(e) => onFilterChange({ manufacturer: e.target.value })}
          className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500/60 transition-colors cursor-pointer"
        >
          <option value="all">All Manufacturers</option>
          {manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* ── View Options (Grid & Pagination) ── */}
      <div className="pt-6 border-t border-zinc-800 space-y-5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            View Options
          </h2>
        </div>

        {/* Desktop Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Monitor className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Desktop Layout</span>
          </div>
          <div className="flex gap-2">
            {([3, 4] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => onGridLayoutChange({ desktop: cols })}
                className={`flex-1 flex flex-col items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  gridLayout.desktop === cols
                    ? "bg-rose-600/20 border-rose-500/60 text-rose-400 shadow-sm shadow-rose-950/30"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                }`}
              >
                <div className={`grid gap-0.5 ${cols === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                  {Array.from({ length: cols * 2 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2.5 h-1.5 rounded-sm ${
                        gridLayout.desktop === cols ? "bg-rose-500/60" : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span>{cols}×{cols}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Smartphone className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Mobile Layout</span>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3, 4] as const).map((cols) => (
              <button
                key={cols}
                onClick={() => onGridLayoutChange({ mobile: cols })}
                className={`flex-1 flex flex-col items-center gap-2 px-2 py-2 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  gridLayout.mobile === cols
                    ? "bg-rose-600/20 border-rose-500/60 text-rose-400 shadow-sm shadow-rose-950/30"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                }`}
              >
                <div className={`grid gap-0.5 ${
                  cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4"
                }`}>
                  {Array.from({ length: cols * 2 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-1.5 rounded-sm ${
                        gridLayout.mobile === cols ? "bg-rose-500/60" : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <span>{cols}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Per Page */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Hash className="w-3.5 h-3.5" />
            <span className="font-semibold uppercase tracking-wider">Per Page</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {([9, 12, 16, 20, 24] as const).map((count) => (
              <button
                key={count}
                onClick={() => onGridLayoutChange({ perPage: count })}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  gridLayout.perPage === count
                    ? "bg-rose-600/20 border-rose-500/60 text-rose-400 shadow-sm shadow-rose-950/30"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Stats Footer */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <span>Showing:</span>
        <span className="text-white font-bold bg-zinc-800 px-2 py-0.5 rounded-md">
          {activeCount} of {totalCount}
        </span>
      </div>
    </aside>
  );
}
