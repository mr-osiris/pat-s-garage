"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import FilterSidebar from "@/components/filters/FilterSidebar";
import MobileFilterDrawer from "@/components/filters/MobileFilterDrawer";
import CollectionGrid from "@/components/collection/CollectionGrid";
import Footer from "@/components/footer/Footer";
import { getCars } from "@/lib/actions/car-actions";
import { Car, FilterState } from "@/lib/types/car";

const initialFilterState: FilterState = {
  search: "",
  brand: "all",
  manufacturer: "all",
  scale: "all",
  yearMin: "",
  yearMax: "",
};

export default function HomePage() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check local admin authentication state from cookie
    const hasAdminCookie = document.cookie.includes("vault_admin_auth=true");
    setIsAdminLoggedIn(hasAdminCookie);

    // Initial load of cars
    async function loadData() {
      setIsLoading(true);
      const data = await getCars();
      setAllCars(data);
      setFilteredCars(data);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Derive unique filter options from actual collection data (no hardcoded constants)
  const uniqueBrands = useMemo(
    () => Array.from(new Set(allCars.map((c) => c.brand))).sort(),
    [allCars]
  );
  const uniqueManufacturers = useMemo(
    () => Array.from(new Set(allCars.map((c) => c.manufacturer))).sort(),
    [allCars]
  );
  const uniqueScales = useMemo(
    () => Array.from(new Set(allCars.map((c) => c.scale))).sort(),
    [allCars]
  );

  // Instant client-side filtering
  useEffect(() => {
    let result = [...allCars];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          (c.series && c.series.toLowerCase().includes(q)) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }

    if (filters.brand !== "all") {
      result = result.filter((c) => c.brand.toLowerCase() === filters.brand.toLowerCase());
    }

    if (filters.manufacturer !== "all") {
      result = result.filter(
        (c) => c.manufacturer.toLowerCase() === filters.manufacturer.toLowerCase()
      );
    }

    if (filters.scale !== "all") {
      result = result.filter((c) => c.scale === filters.scale);
    }

    setFilteredCars(result);
  }, [filters, allCars]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col justify-between">
      <div>
        <Navbar isAdminLoggedIn={isAdminLoggedIn} />
        <Hero />

        {/* Main Content Showcase */}
        <main id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <MobileFilterDrawer
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeCount={filteredCars.length}
            totalCount={allCars.length}
            brands={uniqueBrands}
            manufacturers={uniqueManufacturers}
            scales={uniqueScales}
          />

          {/* Desktop Layout Split: Left sidebar (4 cols) & Right grid (8 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="hidden lg:block lg:col-span-4">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                activeCount={filteredCars.length}
                totalCount={allCars.length}
                brands={uniqueBrands}
                manufacturers={uniqueManufacturers}
                scales={uniqueScales}
              />
            </div>

            <div className="lg:col-span-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-[16/10] bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <CollectionGrid cars={filteredCars} onResetFilters={handleResetFilters} />
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
