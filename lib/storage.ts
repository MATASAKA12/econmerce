import { supabase } from "./supabase"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const BUCKET = "products"

/** Upload a product image and return its public URL */
export async function uploadProductImage(file: File): Promise<string> {
  // ── Validation ──────────────────────────────────────────────────────────
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`)
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`File too large. Max size is ${MAX_SIZE_MB}MB.`)
  }

  // ── Unique filename: timestamp + random suffix prevents collisions ───────
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const uid = Math.random().toString(36).slice(2, 8)
  const fileName = `${Date.now()}-${uid}.${ext}`
  const filePath = `products/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * Delete a product image by its full public URL.
 * Call this if createProduct() fails after a successful upload,
 * or when hard-deleting a product.
 */
export async function deleteProductImage(publicUrl: string): Promise<void> {
  // Extract the storage path from the full URL
  // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return                          // not a supabase storage URL, skip

  const filePath = publicUrl.slice(idx + marker.length)

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath])

  if (error) console.error("Failed to delete image:", error)
}