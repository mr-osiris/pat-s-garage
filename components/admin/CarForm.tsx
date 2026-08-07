"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { carFormSchema, CarFormValues } from "@/lib/schemas/car-schema";
import { SCALES, MATERIALS } from "@/lib/constants/brands-manufacturers";
import ImageUploader from "./ImageUploader";
import { Car } from "@/lib/types/car";
import { ArrowLeft, Save, Sparkles, Upload, X, Loader2, ImageIcon } from "lucide-react";

interface CarFormProps {
  initialCar?: Car | null;
  onSubmitAction: (values: CarFormValues) => Promise<{ success: boolean; error?: string }>;
  isEditing?: boolean;
  existingBrands?: string[];
  existingManufacturers?: string[];
}

// --------------------------------------------------------------------------
// Gallery item: a file pending upload, or an already-uploaded URL (edit mode)
// --------------------------------------------------------------------------
interface GalleryItem {
  key: string;
  previewUrl: string | null;
  uploadedUrl: string | null;
  name: string;
  uploading: boolean;
  error: string | null;
}

function makeKey() {
  return Math.random().toString(36).slice(2);
}

export default function CarForm({ initialCar, onSubmitAction, isEditing, existingBrands = [], existingManufacturers = [] }: CarFormProps) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    (initialCar?.car_images ?? []).map((img) => ({
      key: makeKey(),
      previewUrl: null,
      uploadedUrl: img.image_url,
      name: img.image_url.split("/").pop() ?? "image",
      uploading: false,
      error: null,
    }))
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CarFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(carFormSchema) as any,
    defaultValues: {
      name: initialCar?.name || "",
      brand: initialCar?.brand || "",
      manufacturer: initialCar?.manufacturer || "",
      series: initialCar?.series || "",
      scale: initialCar?.scale || SCALES[0],
      // year intentionally omitted from defaultValues — undefined → null via schema
      color: initialCar?.color || "",
      material: initialCar?.material || MATERIALS[0],
      opening_parts: initialCar?.opening_parts || false,
      description: initialCar?.description || "",
      cover_image: initialCar?.cover_image || "",
      gallery_images: initialCar?.car_images?.map((img) => img.image_url) || [],
    },
  });

  const coverImageValue = watch("cover_image");

  const syncGalleryToForm = (items: GalleryItem[]) => {
    const urls = items
      .filter((i) => i.uploadedUrl !== null)
      .map((i) => i.uploadedUrl as string);
    setValue("gallery_images", urls);
  };

  // ── Gallery file selection ───────────────────────────────────────────────
  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    e.target.value = "";

    const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 10 * 1024 * 1024;

    const newItems: GalleryItem[] = files.map((file) => {
      const typeOk = VALID_TYPES.includes(file.type);
      const sizeOk = file.size <= MAX_SIZE;
      const errorMsg = !typeOk
        ? "Unsupported format (JPEG, PNG, WEBP only)"
        : !sizeOk
        ? "Too large (max 10 MB)"
        : null;

      return {
        key: makeKey(),
        previewUrl: typeOk && sizeOk ? URL.createObjectURL(file) : null,
        uploadedUrl: null,
        name: file.name,
        uploading: typeOk && sizeOk,
        error: errorMsg,
        _file: file,
      } as GalleryItem & { _file: File };
    });

    setGalleryItems((prev) => {
      const next = [...prev, ...newItems];
      syncGalleryToForm(next);
      return next;
    });

    await Promise.all(
      newItems.map(async (item) => {
        const itemWithFile = item as GalleryItem & { _file?: File };
        if (item.error || !itemWithFile._file) return;

        const formData = new FormData();
        formData.append("file", itemWithFile._file);

        try {
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const json = await res.json();

          setGalleryItems((prev) => {
            const next = prev.map((i) =>
              i.key === item.key
                ? {
                    ...i,
                    uploading: false,
                    uploadedUrl: res.ok ? json.url : null,
                    error: res.ok ? null : json.error || "Upload failed",
                  }
                : i
            );
            syncGalleryToForm(next);
            return next;
          });
        } catch {
          setGalleryItems((prev) => {
            const next = prev.map((i) =>
              i.key === item.key
                ? { ...i, uploading: false, error: "Network error. Try again." }
                : i
            );
            syncGalleryToForm(next);
            return next;
          });
        }
      })
    );
  };

  const handleRemoveGalleryItem = (key: string) => {
    setGalleryItems((prev) => {
      const item = prev.find((i) => i.key === key);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      const next = prev.filter((i) => i.key !== key);
      syncGalleryToForm(next);
      return next;
    });
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const onFormSubmit = async (values: CarFormValues) => {
    if (galleryItems.some((i) => i.uploading)) {
      setServerError("Please wait — some images are still uploading.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const res = await onSubmitAction(values);

    if (res.success) {
      router.push("/admin");
      router.refresh();
    } else {
      setServerError(res.error || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  const anyUploading = galleryItems.some((i) => i.uploading);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* ── Header Bar ── */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            {isEditing ? "Edit Replica Details" : "Add New Replica"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-mono font-semibold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || anyUploading}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : anyUploading ? "Uploading..." : isEditing ? "Update Car" : "Save Car"}
          </button>
        </div>
      </div>

      {serverError && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-mono">
          {serverError}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* ── General Model Information ── */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-zinc-800 pb-3">
              General Model Information
            </h2>

            {/* Car Name */}
            <div>
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                Car Name *
              </label>
              <input
                type="text"
                {...register("name")}
                placeholder="e.g. Porsche 911 GT3 RS (992)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
              {errors.name && (
                <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand — free text */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  {...register("brand")}
                  list="existing-brands"
                  placeholder="e.g. Honda, Porsche, Ferrari"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <datalist id="existing-brands">
                  {existingBrands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
                {errors.brand && (
                  <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.brand.message}</p>
                )}
              </div>

              {/* Die-Cast Manufacturer — free text */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                  Die-Cast Manufacturer *
                </label>
                <input
                  type="text"
                  {...register("manufacturer")}
                  list="existing-manufacturers"
                  placeholder="e.g. Hot Wheels Premium, Mini GT, Inno64"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                <datalist id="existing-manufacturers">
                  {existingManufacturers.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                {errors.manufacturer && (
                  <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.manufacturer.message}</p>
                )}
              </div>
            </div>

            {/* Series */}
            <div>
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                Series / Collection Line (Optional)
              </label>
              <input
                type="text"
                {...register("series")}
                placeholder="e.g. Exotic Series #412"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* ── Specifications & Features ── */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-zinc-800 pb-3">
              Specifications & Features
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scale */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">Scale *</label>
                <select
                  {...register("scale")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {SCALES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">Material *</label>
                <select
                  {...register("material")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Finish Color */}
              <div>
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">Finish Color *</label>
                <input
                  type="text"
                  {...register("color")}
                  placeholder="e.g. Guards Red / Black Wheels"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
                {errors.color && (
                  <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.color.message}</p>
                )}
              </div>

              {/* Opening Parts */}
              <div className="flex items-center pt-5">
                <label className="relative flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("opening_parts")}
                    className="w-4 h-4 rounded accent-rose-600 bg-zinc-950 border-zinc-800"
                  />
                  <span className="text-xs font-mono font-semibold text-zinc-200">
                    Has Opening Parts (Hood, Doors, Trunk)
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                Description & Notes
              </label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="Detailed description, special features, packaging details..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider border-b border-zinc-800 pb-3">
              Media & Images
            </h2>

            {/* Cover Image */}
            <ImageUploader
              label="Main Cover Image *"
              value={coverImageValue}
              onChange={(url) => setValue("cover_image", url)}
              helperText="Displayed on the public collection card."
            />
            {errors.cover_image && (
              <p className="text-rose-400 text-[11px] font-mono -mt-4">{errors.cover_image.message}</p>
            )}

            {/* Gallery Images */}
            <div className="space-y-3 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold text-zinc-300 uppercase">
                  Gallery Images ({galleryItems.filter((i) => i.uploadedUrl).length})
                </label>

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleGalleryFilesChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Add Images
                </button>
              </div>

              {galleryItems.length === 0 ? (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-zinc-700 hover:border-rose-500/50 rounded-xl bg-zinc-950/40 hover:bg-zinc-950 transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono">Click to add gallery images</span>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    Select multiple · JPEG, PNG, WEBP · Max 10 MB each
                  </span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {galleryItems.map((item) => (
                    <div
                      key={item.key}
                      className="relative rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 aspect-square group"
                    >
                      {item.previewUrl || item.uploadedUrl ? (
                        <Image
                          src={(item.previewUrl || item.uploadedUrl) as string}
                          alt={item.name}
                          fill
                          className="object-cover"
                          unoptimized={!!item.previewUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-zinc-700" />
                        </div>
                      )}

                      {item.uploading && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-1">
                          <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
                          <span className="text-[9px] text-zinc-400 font-mono">Uploading</span>
                        </div>
                      )}

                      {item.error && (
                        <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center gap-1 p-1">
                          <span className="text-[9px] text-rose-300 font-mono text-center leading-tight">
                            {item.error}
                          </span>
                        </div>
                      )}

                      {!item.uploading && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(item.key)}
                            className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {anyUploading && (
                <p className="text-[10px] text-zinc-500 font-mono text-center animate-pulse">
                  Uploading images to Storage…
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
