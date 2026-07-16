/**
 * Format a number as Nigerian Naira
 * e.g. 18500 → ₦18,500
 */
export const fmt = (n: number): string =>
  `₦${n.toLocaleString("en-NG")}`

/**
 * Calculate discount percentage between original and sale price
 * e.g. (24000, 18500) → 23
 */
export const discountPercent = (price: number, originalPrice: number): number =>
  Math.round((1 - price / originalPrice) * 100)