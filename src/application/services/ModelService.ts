import { ModelRepository } from "@/domain/model/ModelRepository";
import { ModelDTO } from "../dto/ModelDTO";
import { ModelMapper } from "../mappers/ModelMapper";

export class ModelService {
  constructor(private readonly repo: ModelRepository) {}

  async list(featuredOnly = false): Promise<ModelDTO[]> {
    const models = await this.repo.findAll(featuredOnly);
    return ModelMapper.toDTOList(models);
  }

  async getById(id: string): Promise<ModelDTO | null> {
    const model = await this.repo.findById(id);
    return model ? ModelMapper.toDTO(model) : null;
  }
}
