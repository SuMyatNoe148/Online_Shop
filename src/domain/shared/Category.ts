/**
 * Category — domain enum (value object).
 * The brand only sells these three product types.
 */
export const Category = {
  SHIRT: "SHIRT",
  HOODIE: "HOODIE",
  TOP: "TOP",
} as const;

export type Category = (typeof Category)[keyof typeof Category];

export const CATEGORY_LIST: Category[] = [
  Category.SHIRT,
  Category.HOODIE,
  Category.TOP,
];

export const CATEGORY_LABELS: Record<Category, string> = {
  SHIRT: "Shirts",
  HOODIE: "Hoodies",
  TOP: "Tops",
};

export function isCategory(value: string): value is Category {
  return (CATEGORY_LIST as string[]).includes(value);
}
