import { Model } from "./Model";

export interface ModelRepository {
  findAll(featuredOnly?: boolean): Promise<Model[]>;
  findById(id: string): Promise<Model | null>;
}
