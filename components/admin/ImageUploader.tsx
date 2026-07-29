"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  helperText,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setUploadError("Unsupported format. Please upload a JPEG, PNG, or WEBP file.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10 MB.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setPreviewName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setUploadError(json.error || "Upload failed. Please try again.");
        setPreviewName(null);
        return;
      }

      onChange(json.url);
    } catch {
      setUploadError("Network error. Please try again.");
      setPreviewName(null);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setPreviewName(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider block">
        {label}
      </label>

      {/* Hidden file input — triggered by the drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {value ? (
        /* Preview state */
        <div className="space-y-2">
          <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-700 group">
            <Image
              src={value}
              alt="Cover preview"
              fill
              className="object-cover"
              unoptimized={value.startsWith("blob:")}
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>
          {previewName && (
            <p className="text-[10px] text-zinc-500 font-mono truncate">
              ✓ {previewName}
            </p>
          )}
        </div>
      ) : (
        /* Drop zone / upload trigger */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl bg-zinc-950/60 text-center transition-colors ${
            isUploading
              ? "border-rose-500/40 cursor-wait"
              : "border-zinc-700 hover:border-rose-500/60 hover:bg-zinc-950 cursor-pointer"
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
              <span className="text-xs font-semibold text-zinc-300">Uploading to Storage...</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">
                  Click to select image
                </span>
                <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                  JPEG · PNG · WEBP · Max 10 MB
                </span>
              </div>
            </>
          )}
        </button>
      )}

      {uploadError && (
        <p className="text-rose-400 text-[11px] font-mono mt-1">{uploadError}</p>
      )}
      {helperText && !uploadError && (
        <p className="text-[11px] text-zinc-500 font-mono">{helperText}</p>
      )}
    </div>
  );
}
