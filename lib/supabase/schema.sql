-- DieCast Vault Production Database Schema & RLS Security Policies

-- 1. Create CARS table
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  series TEXT,
  scale TEXT NOT NULL DEFAULT '1:64',
  -- Migration for existing databases: ALTER TABLE public.cars ALTER COLUMN year DROP NOT NULL;
  year INTEGER,
  color TEXT NOT NULL,
  material TEXT NOT NULL DEFAULT 'Die-Cast Metal',
  opening_parts BOOLEAN NOT NULL DEFAULT false,
  purchase_date DATE,
  purchase_price NUMERIC(10, 2),
  description TEXT,
  cover_image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 2. Create CAR_IMAGES table for multi-image gallery
CREATE TABLE IF NOT EXISTS public.car_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_cars_brand ON public.cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_manufacturer ON public.cars(manufacturer);
CREATE INDEX IF NOT EXISTS idx_cars_scale ON public.cars(scale);
CREATE INDEX IF NOT EXISTS idx_cars_deleted_at ON public.cars(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_car_images_car_id ON public.car_images(car_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_images ENABLE ROW LEVEL SECURITY;

-- 5. CARS Table Security Policies
-- Public view policy: anyone can read non-deleted cars
CREATE POLICY "Public Read Access for Cars"
  ON public.cars
  FOR SELECT
  USING (deleted_at IS NULL);

-- Admin insert policy
CREATE POLICY "Admin Insert Access for Cars"
  ON public.cars
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Admin update policy
CREATE POLICY "Admin Update Access for Cars"
  ON public.cars
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admin delete policy (or soft-delete update)
CREATE POLICY "Admin Delete Access for Cars"
  ON public.cars
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 6. CAR_IMAGES Security Policies
CREATE POLICY "Public Read Access for Car Images"
  ON public.car_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cars
      WHERE cars.id = car_images.car_id AND cars.deleted_at IS NULL
    )
  );

CREATE POLICY "Admin Insert Access for Car Images"
  ON public.car_images
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access for Car Images"
  ON public.car_images
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Access for Car Images"
  ON public.car_images
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 7. Supabase Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'car-images',
  'car-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage Security Policies
CREATE POLICY "Public Storage Read Access"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'car-images');

CREATE POLICY "Admin Storage Insert Access"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Storage Delete Access"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');

-- 8. Site Settings table (key-value store for admin-configurable options)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (grid layout etc.)
CREATE POLICY "Public Read Access for Site Settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only authenticated admin can modify settings
CREATE POLICY "Admin Insert Access for Site Settings"
  ON public.site_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin Update Access for Site Settings"
  ON public.site_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Seed default grid layout
INSERT INTO public.site_settings (key, value)
VALUES ('grid_layout', '{"desktop": 3, "mobile": 1}'::jsonb)
ON CONFLICT (key) DO NOTHING;
