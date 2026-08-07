"use server";

import { createClient } from "@/lib/supabase/server";
import { Car } from "@/lib/types/car";
import { CarFormValues } from "@/lib/schemas/car-schema";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// resolveExistingValue — case-insensitive lookup against existing DB values.
// If a match is found, returns the canonical (already-stored) version;
// otherwise returns the user input as-is.
// ---------------------------------------------------------------------------
async function resolveExistingValue(
  column: "brand" | "manufacturer",
  userInput: string
): Promise<string> {
  const supabase = await createClient();
  // Fetch all distinct non-null values for the column
  const { data } = await supabase
    .from("cars")
    .select(column)
    .is("deleted_at", null);

  if (!data || data.length === 0) return userInput;

  const needle = userInput.trim().toLowerCase();
  for (const row of data) {
    const val = (row as Record<string, string>)[column];
    if (val && val.trim().toLowerCase() === needle) {
      return val; // return the canonical DB value
    }
  }
  return userInput.trim();
}

// ---------------------------------------------------------------------------
// getDistinctBrandsAndManufacturers — for form autocomplete / suggestions.
// Returns deduplicated lists (case-insensitive, keeps first occurrence).
// ---------------------------------------------------------------------------
export async function getDistinctBrandsAndManufacturers(): Promise<{
  brands: string[];
  manufacturers: string[];
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("cars")
    .select("brand, manufacturer")
    .is("deleted_at", null);

  if (!data) return { brands: [], manufacturers: [] };

  const brandMap = new Map<string, string>();
  const mfgMap = new Map<string, string>();

  for (const row of data) {
    const bKey = row.brand.trim().toLowerCase();
    if (!brandMap.has(bKey)) brandMap.set(bKey, row.brand.trim());
    const mKey = row.manufacturer.trim().toLowerCase();
    if (!mfgMap.has(mKey)) mfgMap.set(mKey, row.manufacturer.trim());
  }

  return {
    brands: Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b)),
    manufacturers: Array.from(mfgMap.values()).sort((a, b) => a.localeCompare(b)),
  };
}

// ---------------------------------------------------------------------------
// getCars — fetches all non-deleted cars, optionally filtered.
// Returns [] when the table is empty — this is NOT an error.
// ---------------------------------------------------------------------------
export async function getCars(filters?: {
  search?: string;
  brand?: string;
  manufacturer?: string;
  scale?: string;
}): Promise<Car[]> {
  const supabase = await createClient();

  let query = supabase
    .from("cars")
    .select("*, car_images(*)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,series.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }
  if (filters?.brand && filters.brand !== "all") {
    query = query.eq("brand", filters.brand);
  }
  if (filters?.manufacturer && filters.manufacturer !== "all") {
    query = query.eq("manufacturer", filters.manufacturer);
  }
  if (filters?.scale && filters.scale !== "all") {
    query = query.eq("scale", filters.scale);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getCars] Supabase error:", error.message);
    return [];
  }

  return (data as Car[]) ?? [];
}

// ---------------------------------------------------------------------------
// getCarById — fetches a single car by id.
// ---------------------------------------------------------------------------
export async function getCarById(id: string): Promise<Car | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cars")
    .select("*, car_images(*)")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("[getCarById] Supabase error:", error.message);
    return null;
  }

  return data as Car;
}

// ---------------------------------------------------------------------------
// createCar — inserts a new car + optional gallery images.
// ---------------------------------------------------------------------------
export async function createCar(
  values: CarFormValues
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  // Resolve brand & manufacturer against existing DB values (case-insensitive)
  const [resolvedBrand, resolvedManufacturer] = await Promise.all([
    resolveExistingValue("brand", values.brand),
    resolveExistingValue("manufacturer", values.manufacturer),
  ]);

  const { data: carData, error: carError } = await supabase
    .from("cars")
    .insert({
      name: values.name,
      brand: resolvedBrand,
      manufacturer: resolvedManufacturer,
      series: values.series || null,
      scale: values.scale,
      year: values.year ?? null,       // null when not provided
      color: values.color,
      material: values.material,
      opening_parts: values.opening_parts,
      // purchase_date / purchase_price intentionally omitted — left NULL
      description: values.description || null,
      cover_image: values.cover_image,
    })
    .select()
    .single();

  if (carError) {
    console.error("[createCar] Supabase error:", carError.message);
    return { success: false, error: carError.message };
  }

  if (values.gallery_images && values.gallery_images.length > 0) {
    const imageRows = values.gallery_images.map((url, idx) => ({
      car_id: carData.id,
      image_url: url,
      display_order: idx,
    }));
    const { error: imgError } = await supabase.from("car_images").insert(imageRows);
    if (imgError) {
      console.error("[createCar] Gallery images error:", imgError.message);
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, id: carData.id };
}

// ---------------------------------------------------------------------------
// updateCar — updates an existing car and replaces its gallery images.
// ---------------------------------------------------------------------------
export async function updateCar(
  id: string,
  values: CarFormValues
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Resolve brand & manufacturer against existing DB values (case-insensitive)
  const [resolvedBrand, resolvedManufacturer] = await Promise.all([
    resolveExistingValue("brand", values.brand),
    resolveExistingValue("manufacturer", values.manufacturer),
  ]);

  const { error: updateError } = await supabase
    .from("cars")
    .update({
      name: values.name,
      brand: resolvedBrand,
      manufacturer: resolvedManufacturer,
      series: values.series || null,
      scale: values.scale,
      year: values.year ?? null,
      color: values.color,
      material: values.material,
      opening_parts: values.opening_parts,
      // purchase_date / purchase_price intentionally omitted — left as-is
      description: values.description || null,
      cover_image: values.cover_image,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error("[updateCar] Supabase error:", updateError.message);
    return { success: false, error: updateError.message };
  }

  await supabase.from("car_images").delete().eq("car_id", id);

  if (values.gallery_images && values.gallery_images.length > 0) {
    const imageRows = values.gallery_images.map((url, idx) => ({
      car_id: id,
      image_url: url,
      display_order: idx,
    }));
    await supabase.from("car_images").insert(imageRows);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/car/${id}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// softDeleteCar — marks a car as deleted without removing it from the DB.
// ---------------------------------------------------------------------------
export async function softDeleteCar(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("cars")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[softDeleteCar] Supabase error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

// ---------------------------------------------------------------------------
// normalizeBrandsAndManufacturers — one-time cleanup to unify casing of
// existing brand/manufacturer values across all cars.
// Groups by lowercase key, picks the most-used variant as canonical,
// then updates any rows that differ.
// ---------------------------------------------------------------------------
export async function normalizeBrandsAndManufacturers(): Promise<{
  success: boolean;
  brandsFixed: number;
  manufacturersFixed: number;
  error?: string;
}> {
  const supabase = await createClient();

  const { data: allCars, error: fetchError } = await supabase
    .from("cars")
    .select("id, brand, manufacturer")
    .is("deleted_at", null);

  if (fetchError) {
    return { success: false, brandsFixed: 0, manufacturersFixed: 0, error: fetchError.message };
  }

  if (!allCars || allCars.length === 0) {
    return { success: true, brandsFixed: 0, manufacturersFixed: 0 };
  }

  // For each column, find the canonical version (most frequently used variant)
  async function normalizeColumn(column: "brand" | "manufacturer"): Promise<number> {
    const groups = new Map<string, Map<string, number>>();

    for (const car of allCars!) {
      const val = (car as Record<string, string>)[column];
      const key = val.trim().toLowerCase();
      if (!groups.has(key)) groups.set(key, new Map());
      const variants = groups.get(key)!;
      variants.set(val, (variants.get(val) || 0) + 1);
    }

    let fixCount = 0;

    for (const [, variants] of groups) {
      if (variants.size <= 1) continue; // no duplicates

      // Pick the most-used variant as canonical
      let canonical = "";
      let maxCount = 0;
      for (const [variant, count] of variants) {
        if (count > maxCount) {
          maxCount = count;
          canonical = variant;
        }
      }

      // Update all non-canonical rows
      for (const [variant] of variants) {
        if (variant === canonical) continue;
        const idsToFix = allCars!
          .filter((c) => (c as Record<string, string>)[column] === variant)
          .map((c) => c.id);

        if (idsToFix.length > 0) {
          await supabase
            .from("cars")
            .update({ [column]: canonical })
            .in("id", idsToFix);
          fixCount += idsToFix.length;
        }
      }
    }

    return fixCount;
  }

  const [brandsFixed, manufacturersFixed] = await Promise.all([
    normalizeColumn("brand"),
    normalizeColumn("manufacturer"),
  ]);

  revalidatePath("/");
  revalidatePath("/admin");

  return { success: true, brandsFixed, manufacturersFixed };
}
