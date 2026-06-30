import { ProductProps } from "@/domain/product/Product";
import { ModelProps } from "@/domain/model/Model";
import { Category } from "@/domain/shared/Category";

const img = (id: string, w = 900, h = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/**
 * Seed/sample catalogue. Replace image ids + copy with your real product photos.
 * Prices are in MINOR units (cents).
 */
export const SAMPLE_PRODUCTS: ProductProps[] = [
  {
    id: "p-shirt-eclipse",
    slug: "eclipse-oxford-shirt",
    name: "Eclipse Oxford Shirt",
    description:
      "A tailored oxford shirt cut from breathable cotton with a structured collar and mother-of-pearl buttons. Designed to move between the office and the night.",
    category: Category.SHIRT,
    price: 2500000,
    currency: "MMK",
    images: [
      img("photo-1596755094514-f87e34085b2c"),
      img("photo-1603252109303-2751441dd157"),
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Stone"],
    stock: 42,
    featured: true,
    createdAt: new Date("2025-01-10"),
  },
  {
    id: "p-shirt-noir",
    slug: "noir-linen-shirt",
    name: "Noir Linen Shirt",
    description:
      "Relaxed linen shirt with a soft drape and a tonal chest pocket. Light enough for summer, refined enough for everything else.",
    category: Category.SHIRT,
    price: 2800000,
    currency: "MMK",
    images: [
      img("photo-1602810318383-e386cc2a3ccf"),
      img("photo-1620012253295-c15cc3e65df4"),
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Charcoal", "Sand"],
    stock: 30,
    featured: false,
    createdAt: new Date("2025-01-12"),
  },
  {
    id: "p-hoodie-abyss",
    slug: "abyss-heavyweight-hoodie",
    name: "Abyss Heavyweight Hoodie",
    description:
      "450gsm brushed-back fleece with a double-layer hood, embroidered wordmark, and a boxy modern fit. The signature ABYSS staple.",
    category: Category.HOODIE,
    price: 3500000,
    currency: "MMK",
    images: [
      img("photo-1556821840-3a63f95609a7"),
      img("photo-1620799140408-edc6dcb6d633"),
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Bone", "Slate"],
    stock: 58,
    featured: true,
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "p-hoodie-fog",
    slug: "fog-zip-hoodie",
    name: "Fog Full-Zip Hoodie",
    description:
      "A clean full-zip in midweight loopback cotton with a YKK zipper and ribbed cuffs. Layer it under everything.",
    category: Category.HOODIE,
    price: 3200000,
    currency: "MMK",
    images: [
      img("photo-1578768079052-aa76e52ff62e"),
      img("photo-1614975059251-992f11792b9f"),
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Fog Grey", "Black"],
    stock: 24,
    featured: false,
    createdAt: new Date("2025-01-18"),
  },
  {
    id: "p-top-mono",
    slug: "mono-ribbed-top",
    name: "Mono Ribbed Top",
    description:
      "A second-skin ribbed top with a sculpted neckline and stretch recovery that holds its shape wear after wear.",
    category: Category.TOP,
    price: 1500000,
    currency: "MMK",
    images: [
      img("photo-1521572163474-6864f9cf17ab"),
      img("photo-1581655353564-df123a1eb820"),
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: ["Black", "Ivory", "Olive"],
    stock: 70,
    featured: true,
    createdAt: new Date("2025-01-20"),
  },
  {
    id: "p-top-mesh",
    slug: "mirage-mesh-top",
    name: "Mirage Mesh Top",
    description:
      "A breathable performance mesh top with flatlock seams and a cropped silhouette — built for movement.",
    category: Category.TOP,
    price: 1800000,
    currency: "MMK",
    images: [
      img("photo-1503342217505-b0a15ec3261c"),
      img("photo-1485518882345-15568b007407"),
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White"],
    stock: 36,
    featured: false,
    createdAt: new Date("2025-01-22"),
  },
];

export const SAMPLE_MODELS: ModelProps[] = [
  {
    id: "m-aria",
    name: "Aria Vance",
    role: "Lead Campaign Model",
    bio: "Aria fronts the seasonal ABYSS campaigns, bringing an effortless edge to every silhouette.",
    photo: img("photo-1529626455594-4ff0802cfb7e", 800, 1000),
    instagram: "@aria.vance",
    featured: true,
    createdAt: new Date("2025-01-05"),
  },
  {
    id: "m-koa",
    name: "Koa Reyes",
    role: "Menswear Model",
    bio: "Koa anchors the menswear line — tailored shirts, heavyweight hoodies, and everything in between.",
    photo: img("photo-1500648767791-00dcc994a43e", 800, 1000),
    instagram: "@koa.reyes",
    featured: true,
    createdAt: new Date("2025-01-06"),
  },
  {
    id: "m-mira",
    name: "Mira Sol",
    role: "Tops & Streetwear",
    bio: "Mira styles the ABYSS tops collection with a streetwear sensibility and a sharp eye for fit.",
    photo: img("photo-1524504388940-b1c1722653e1", 800, 1000),
    instagram: "@mira.sol",
    featured: true,
    createdAt: new Date("2025-01-07"),
  },
];
