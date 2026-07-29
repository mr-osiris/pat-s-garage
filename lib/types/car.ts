export interface Car {
  id: string;
  name: string;
  brand: string;
  manufacturer: string;
  series?: string | null;
  scale: string;
  year: number;
  color: string;
  material: string;
  opening_parts: boolean;
  purchase_date?: string | null;
  purchase_price?: number | null;
  description?: string | null;
  cover_image: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  car_images?: CarImage[];
}

export interface CarImage {
  id: string;
  car_id: string;
  image_url: string;
  display_order: number;
  created_at?: string;
}

export interface FilterState {
  search: string;
  brand: string;
  manufacturer: string;
  scale: string;
  yearMin: string;
  yearMax: string;
}

export type SortOption = "newest" | "oldest" | "year_desc" | "year_asc" | "name_asc";
