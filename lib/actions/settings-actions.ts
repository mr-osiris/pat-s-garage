"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// GridLayout type
// ---------------------------------------------------------------------------
export interface GridLayout {
  desktop: 3 | 4;
  mobile: 1 | 2 | 3 | 4;
  perPage: 9 | 12 | 16 | 20 | 24;
}

const VALID_PER_PAGE = [9, 12, 16, 20, 24] as const;
type PerPage = (typeof VALID_PER_PAGE)[number];

const DEFAULT_GRID: GridLayout = { desktop: 3, mobile: 1, perPage: 12 };

// ---------------------------------------------------------------------------
// getGridLayout — reads the grid_layout setting from site_settings.
// Falls back to defaults if the table doesn't exist or no row is found.
// ---------------------------------------------------------------------------
export async function getGridLayout(): Promise<GridLayout> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "grid_layout")
    .single();

  if (error || !data) {
    // Table may not exist yet — return defaults
    return DEFAULT_GRID;
  }

  const val = data.value as Partial<GridLayout>;
  return {
    desktop: val.desktop === 4 ? 4 : 3,
    mobile: ([1, 2, 3, 4] as const).includes(val.mobile as 1 | 2 | 3 | 4)
      ? (val.mobile as 1 | 2 | 3 | 4)
      : 1,
    perPage: VALID_PER_PAGE.includes(val.perPage as PerPage)
      ? (val.perPage as PerPage)
      : 12,
  };
}

// ---------------------------------------------------------------------------
// updateGridLayout — upserts the grid_layout setting.
// ---------------------------------------------------------------------------
export async function updateGridLayout(
  layout: GridLayout
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Validate
  const desktop = layout.desktop === 4 ? 4 : 3;
  const mobile = ([1, 2, 3, 4] as const).includes(layout.mobile) ? layout.mobile : 1;
  const perPage = VALID_PER_PAGE.includes(layout.perPage) ? layout.perPage : 12;

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      {
        key: "grid_layout",
        value: { desktop, mobile, perPage },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );

  if (error) {
    console.error("[updateGridLayout] Supabase error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

