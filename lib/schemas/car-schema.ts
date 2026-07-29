import { z } from "zod";

export const carFormSchema = z.object({
  name: z.string().min(2, "Car name must be at least 2 characters."),
  brand: z.string().min(1, "Please select or specify a brand."),
  manufacturer: z.string().min(1, "Please select or specify a die-cast manufacturer."),
  series: z.string().optional().nullable(),
  scale: z.string().min(1, "Scale is required (e.g. 1:64)."),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear() + 2, "Year cannot be in the far future"),
  color: z.string().min(1, "Color finish is required."),
  material: z.string().min(1, "Material specification is required."),
  opening_parts: z.boolean().default(false),
  purchase_date: z.string().optional().nullable(),
  purchase_price: z.coerce.number().min(0, "Price must be positive").optional().nullable(),
  description: z.string().optional().nullable(),
  cover_image: z.string().min(1, "Cover image is required."),
  gallery_images: z.array(z.string()).default([]),
});

export type CarFormValues = z.infer<typeof carFormSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid admin email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
