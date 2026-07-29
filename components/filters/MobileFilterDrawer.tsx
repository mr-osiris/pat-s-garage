"use client";

import { useState } from "react";
import { Filter, X, RotateCcw, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FilterState } from "@/lib/types/car";

interface MobileFilterDrawerProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  activeCount: number;
  totalCount: number;
  brands: string[];
  manufacturers: string[];
  scales: string[];
}

export default function MobileFilterDrawer({
  filters,
  onFilterChange,
  onReset,
  activeCount,
  totalCount,
  brands,
  manufacturers,
  scales,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isFiltered =
    filters.search !== "" ||
    filters.brand !== "all" ||
    filters.manufacturer !== "all" ||
    filters.scale !== "all";

  return (
    <div className="lg:hidden mb-6">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium text-white shadow-lg cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-rose-500" />
          <span>Filters &amp; Search</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
          {activeCount} / {totalCount}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-xs bg-zinc-950 border-l border-zinc-800 h-full p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-rose-500" />
                    <h3 className="text-base font-bold text-white uppercase font-mono">
                      Filter Vault
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase font-mono">
                    Search Model
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => onFilterChange({ search: e.target.value })}
                      placeholder="Search Porsche, R34..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
                    />
                  </div>
                </div>

                {/* Brand — dynamic */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase font-mono">
                    Brand
                  </label>
                  <select
                    value={filters.brand}
                    onChange={(e) => onFilterChange({ brand: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500/60 cursor-pointer"
                  >
                    <option value="all">All Brands ({totalCount})</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scale — dynamic pill buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase font-mono">
                    Scale
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => onFilterChange({ scale: "all" })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer ${
                        filters.scale === "all"
                          ? "bg-rose-600 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      All
                    </button>
                    {scales.map((s) => (
                      <button
                        key={s}
                        onClick={() => onFilterChange({ scale: s })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium cursor-pointer ${
                          filters.scale === s
                            ? "bg-rose-600 text-white"
                            : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Manufacturer — dynamic */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase font-mono">
                    Manufacturer
                  </label>
                  <select
                    value={filters.manufacturer}
                    onChange={(e) => onFilterChange({ manufacturer: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500/60 cursor-pointer"
                  >
                    <option value="all">All Manufacturers</option>
                    {manufacturers.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 space-y-3 border-t border-zinc-800">
                {isFiltered && (
                  <button
                    onClick={onReset}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Filters
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View {activeCount} Replicas
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
