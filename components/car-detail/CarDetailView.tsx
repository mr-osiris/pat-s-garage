"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Award,
  DollarSign,
  Layers,
  Sparkles,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Car } from "@/lib/types/car";

interface CarDetailViewProps {
  car: Car;
}

export default function CarDetailView({ car }: CarDetailViewProps) {
  const allImages = [
    car.cover_image,
    ...(car.car_images || []).map((img) => img.image_url),
  ].filter((url, index, self) => self.indexOf(url) === index);

  const [activeImage, setActiveImage] = useState(allImages[0] || car.cover_image);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sync lightbox index when active image changes
  const openLightbox = (img: string) => {
    const idx = allImages.indexOf(img);
    setLightboxIndex(idx >= 0 ? idx : 0);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const lightboxPrev = () =>
    setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const lightboxNext = () =>
    setLightboxIndex((i) => (i + 1) % allImages.length);

  // Keyboard: Escape to close, arrows to navigate
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  return (
    <>
      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            {/* Stop propagation so clicking the image itself doesn't close */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-rose-500/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev */}
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={lightboxPrev}
                  className="absolute left-4 z-10 p-2 rounded-xl bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-rose-500/60 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto px-16 py-10"
                >
                  <Image
                    src={allImages[lightboxIndex]}
                    alt={`${car.name} — image ${lightboxIndex + 1}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                    unoptimized
                  />
                </motion.div>
              </AnimatePresence>

              {/* Next */}
              {allImages.length > 1 && (
                <button
                  type="button"
                  onClick={lightboxNext}
                  className="absolute right-4 z-10 p-2 rounded-xl bg-zinc-900/80 border border-zinc-700 text-zinc-300 hover:text-white hover:border-rose-500/60 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-700 text-xs font-mono text-zinc-400">
                  {lightboxIndex + 1} / {allImages.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Content ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
        {/* Navigation Header */}
        <div>
          <Link
            href="/#collection"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-rose-500/40 text-xs font-semibold uppercase tracking-wider transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            Back to Collection
          </Link>
        </div>

        {/* Main Grid: Gallery Left (7) + Specs Right (5) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Left Column: Image Gallery ── */}
          <div className="lg:col-span-7 space-y-4">

            {/* Active Main Image Viewer
                - Dark background so portrait photos look intentional
                - object-contain: NEVER crops the image
                - max-h-[520px] caps height on desktop so tall portraits don't
                  push the specs panel off screen
                - cursor-zoom-in signals it's clickable for lightbox */}
            <div
              className="relative w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl cursor-zoom-in"
              style={{ minHeight: "280px", maxHeight: "520px", height: "clamp(280px, 52vw, 520px)" }}
              onClick={() => openLightbox(activeImage)}
              title="Click to enlarge"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={activeImage}
                    alt={car.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-contain p-3"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Top Badges — always visible */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-xs font-mono font-bold text-white">
                  {car.scale}
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-600/80 border border-rose-400/30 backdrop-blur-md text-xs font-mono font-bold text-white uppercase">
                  {car.brand}
                </span>
              </div>

              {/* Expand hint */}
              <div className="absolute bottom-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 border border-white/10 text-zinc-400 pointer-events-none">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Gallery Thumbnails
                Thumbnails keep object-cover — they are small navigation aids,
                cropping here is acceptable and keeps them visually dense. */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                      activeImage === imgUrl
                        ? "border-rose-500 scale-105 shadow-lg shadow-rose-950/50"
                        : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${car.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right Column: Specs ── */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Title & Brand */}
              <div>
                <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-widest block mb-1">
                  {car.brand} • {car.year}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {car.name}
                </h1>
              </div>

              {/* Description */}
              {car.description && (
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
                  {car.description}
                </p>
              )}

              {/* Technical Specifications */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  Technical Specifications
                </h3>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block">Manufacturer</span>
                    <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                      <Award className="w-3.5 h-3.5 text-rose-400" />
                      {car.manufacturer}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Scale</span>
                    <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      {car.scale}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Finish Color</span>
                    <span className="text-white font-semibold mt-0.5 block truncate">
                      {car.color}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Material</span>
                    <span className="text-white font-semibold mt-0.5 block truncate">
                      {car.material}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">Opening Parts</span>
                    <span
                      className={`font-semibold mt-0.5 block ${
                        car.opening_parts ? "text-rose-400" : "text-zinc-400"
                      }`}
                    >
                      {car.opening_parts ? "Yes (Doors / Hood)" : "Sealed Body"}
                    </span>
                  </div>

                  {car.series && (
                    <div>
                      <span className="text-zinc-500 block">Series</span>
                      <span className="text-white font-semibold mt-0.5 block truncate">
                        {car.series}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acquisition Specs */}
                {(car.purchase_date || car.purchase_price) && (
                  <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-4 text-xs font-mono">
                    {car.purchase_date && (
                      <div>
                        <span className="text-zinc-500 block">Acquired Date</span>
                        <span className="text-zinc-300 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {car.purchase_date}
                        </span>
                      </div>
                    )}
                    {car.purchase_price && (
                      <div>
                        <span className="text-zinc-500 block">Value / Price</span>
                        <span className="text-rose-400 font-bold mt-0.5 flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-rose-500" />
                          ${car.purchase_price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
