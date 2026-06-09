import { Model } from "@/domain/model/Model";
import { ModelRepository } from "@/domain/model/ModelRepository";
import { SAMPLE_MODELS } from "../data/sampleData";

const store: Model[] = SAMPLE_MODELS.map((m) => new Model({ ...m }));

export class InMemoryModelRepository implements ModelRepository {
  async findAll(featuredOnly = false): Promise<Model[]> {
    return featuredOnly ? store.filter((m) => m.featured) : [...store];
  }

  async findById(id: string): Promise<Model | null> {
    return store.find((m) => m.id === id) ?? null;
  }
}
