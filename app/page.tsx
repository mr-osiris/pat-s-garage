"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/navbar/Navbar";
import FilterSidebar from "@/components/filters/FilterSidebar";
import MobileFilterDrawer from "@/components/filters/MobileFilterDrawer";
import CollectionGrid from "@/components/collection/CollectionGrid";
import Footer from "@/components/footer/Footer";
import { getCars } from "@/lib/actions/car-actions";
import { Car, FilterState, GridLayout } from "@/lib/types/car";

const initialFilterState: FilterState = {
  search: "",
  brand: "all",
  manufacturer: "all",
  scale: "all",
};

export default function HomePage() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>({ desktop: 3, mobile: 1, perPage: 12 });

  useEffect(() => {
    // Check local admin authentication state from cookie
    const hasAdminCookie = document.cookie.includes("vault_admin_auth=true");
    setIsAdminLoggedIn(hasAdminCookie);

    // Read grid layout from local storage
    const storedLayout = localStorage.getItem("vault_grid_layout");
    if (storedLayout) {
      try {
        const parsed = JSON.parse(storedLayout);
        setGridLayout({
          desktop: parsed.desktop === 4 ? 4 : 3,
          mobile: [1, 2, 3, 4].includes(parsed.mobile) ? parsed.mobile : 1,
          perPage: [9, 12, 16, 20, 24].includes(parsed.perPage) ? parsed.perPage : 12,
        });
      } catch (e) {
        // use defaults if parsing fails
      }
    }

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

  const handleGridLayoutChange = (newLayout: Partial<GridLayout>) => {
    setGridLayout((prev) => {
      const updated = { ...prev, ...newLayout };
      localStorage.setItem("vault_grid_layout", JSON.stringify(updated));
      return updated;
    });
  };

  // Derive unique filter options from actual collection data (case-insensitive dedup)
  const uniqueBrands = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allCars) {
      const key = c.brand.trim().toLowerCase();
      if (!map.has(key)) map.set(key, c.brand.trim());
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [allCars]);

  const uniqueManufacturers = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of allCars) {
      const key = c.manufacturer.trim().toLowerCase();
      if (!map.has(key)) map.set(key, c.manufacturer.trim());
    }
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [allCars]);

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

        {/* Collection — pt-[72px] clears the fixed navbar (~68px tall) */}
        <main id="collection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[72px] pb-16">
          <MobileFilterDrawer
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            activeCount={filteredCars.length}
            totalCount={allCars.length}
            brands={uniqueBrands}
            manufacturers={uniqueManufacturers}
            scales={uniqueScales}
            gridLayout={gridLayout}
            onGridLayoutChange={handleGridLayoutChange}
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
                gridLayout={gridLayout}
                onGridLayoutChange={handleGridLayoutChange}
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
                <CollectionGrid
                  cars={filteredCars}
                  onResetFilters={handleResetFilters}
                  desktopCols={gridLayout.desktop}
                  mobileCols={gridLayout.mobile}
                  perPage={gridLayout.perPage}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
