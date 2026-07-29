"use server";

import { createClient } from "@/lib/supabase/server";
import { Car } from "@/lib/types/car";
import { CarFormValues } from "@/lib/schemas/car-schema";
import { revalidatePath } from "next/cache";

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

  const { data: carData, error: carError } = await supabase
    .from("cars")
    .insert({
      name: values.name,
      brand: values.brand,
      manufacturer: values.manufacturer,
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

  const { error: updateError } = await supabase
    .from("cars")
    .update({
      name: values.name,
      brand: values.brand,
      manufacturer: values.manufacturer,
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
