import { z } from "zod"

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum, `Maksimal ${maximum} karakter.`)
    .transform((value) => value || null)

const optionalNumber = (minimum: number, maximum: number, label: string) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.coerce.number().min(minimum, `${label} tidak valid.`).max(maximum, `${label} tidak valid.`).nullable(),
  )

export const venueSchema = z
  .object({
    address: z.string().trim().min(10, "Alamat minimal 10 karakter.").max(500, "Alamat maksimal 500 karakter."),
    city: z.string().trim().min(2, "Kota minimal 2 karakter.").max(80, "Kota maksimal 80 karakter."),
    closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam tutup tidak valid."),
    description: optionalText(3000),
    email: z
      .string()
      .trim()
      .max(150, "Email maksimal 150 karakter.")
      .refine((value) => !value || z.email().safeParse(value).success, "Email venue tidak valid.")
      .transform((value) => value.toLowerCase() || null),
    facilities: z
      .string()
      .max(1000, "Daftar fasilitas terlalu panjang.")
      .transform((value) => [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))]),
    imageUrls: z
      .string()
      .max(4000, "Daftar URL gambar terlalu panjang.")
      .transform((value, context) => {
        const urls = [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))]
        if (urls.some((url) => !z.url().safeParse(url).success)) {
          context.addIssue({ code: "custom", message: "Setiap URL gambar harus valid." })
          return z.NEVER
        }
        return urls
      }),
    latitude: optionalNumber(-90, 90, "Latitude"),
    longitude: optionalNumber(-180, 180, "Longitude"),
    name: z.string().trim().min(3, "Nama minimal 3 karakter.").max(120, "Nama maksimal 120 karakter."),
    openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Jam buka tidak valid."),
    phone: optionalText(30),
    province: z.string().trim().min(2, "Provinsi minimal 2 karakter.").max(80, "Provinsi maksimal 80 karakter."),
    slug: z
      .string()
      .trim()
      .min(3, "Slug minimal 3 karakter.")
      .max(120, "Slug maksimal 120 karakter.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Gunakan huruf kecil, angka, dan tanda hubung."),
  })
  .refine((values) => values.openingTime < values.closingTime, {
    message: "Jam tutup harus setelah jam buka.",
    path: ["closingTime"],
  })

export const courtSchema = z.object({
  courtNumber: z.coerce.number().int("Nomor lapangan harus bulat.").min(1, "Nomor lapangan minimal 1.").max(999, "Nomor lapangan maksimal 999."),
  indoor: z.enum(["true", "false"]).transform((value) => value === "true"),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true"),
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80, "Nama maksimal 80 karakter."),
  pricePerHour: z.coerce
    .number()
    .int("Harga harus berupa angka bulat.")
    .min(10000, "Harga minimal Rp10.000.")
    .max(100000000, "Harga maksimal Rp100.000.000."),
  surfaceType: z.enum(["PANORAMIC", "STANDARD", "SINGLE"], { error: "Pilih tipe lapangan yang valid." }),
  venueId: z.uuid("Venue tidak valid."),
})

export const slotMutationSchema = z.object({
  blockedReason: z.string().trim().min(5, "Alasan minimal 5 karakter.").max(300, "Alasan maksimal 300 karakter.").optional(),
  slotId: z.uuid("Slot tidak valid."),
  targetStatus: z.enum(["AVAILABLE", "BLOCKED"]),
})

export const venueReviewSchema = z.object({
  reason: z.string().trim().min(10, "Alasan minimal 10 karakter.").max(1000, "Alasan maksimal 1000 karakter."),
  venueId: z.uuid("Venue tidak valid."),
})

export function fieldsFromZod(error: z.ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form"
    fields[key] = [...(fields[key] ?? []), issue.message]
  }
  return fields
}
