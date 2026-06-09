import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS, SAMPLE_MODELS } from "../src/infrastructure/data/sampleData";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ABYSS database…");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.model.deleteMany();

  for (const p of SAMPLE_PRODUCTS) {
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category as any,
        price: p.price,
        currency: p.currency,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        featured: p.featured,
      },
    });
  }

  for (const m of SAMPLE_MODELS) {
    await prisma.model.create({
      data: {
        name: m.name,
        role: m.role,
        bio: m.bio,
        photo: m.photo,
        instagram: m.instagram,
        featured: m.featured,
      },
    });
  }

  console.log(
    `Seeded ${SAMPLE_PRODUCTS.length} products and ${SAMPLE_MODELS.length} models.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
