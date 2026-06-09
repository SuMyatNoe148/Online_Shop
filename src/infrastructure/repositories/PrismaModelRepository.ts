import { Model } from "@/domain/model/Model";
import { ModelRepository } from "@/domain/model/ModelRepository";
import { prisma } from "../db/prisma";

export class PrismaModelRepository implements ModelRepository {
  async findAll(featuredOnly = false): Promise<Model[]> {
    const rows = await prisma.model.findMany({
      where: featuredOnly ? { featured: true } : undefined,
      orderBy: { createdAt: "asc" },
    });
    return rows.map(
      (r: any) =>
        new Model({
          id: r.id,
          name: r.name,
          role: r.role,
          bio: r.bio,
          photo: r.photo,
          instagram: r.instagram ?? undefined,
          featured: r.featured,
          createdAt: r.createdAt,
        }),
    );
  }

  async findById(id: string): Promise<Model | null> {
    const r = await prisma.model.findUnique({ where: { id } });
    return r
      ? new Model({
          id: r.id,
          name: r.name,
          role: r.role,
          bio: r.bio,
          photo: r.photo,
          instagram: r.instagram ?? undefined,
          featured: r.featured,
          createdAt: r.createdAt,
        })
      : null;
  }
}
