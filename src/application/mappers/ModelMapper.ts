import { Model } from "@/domain/model/Model";
import { ModelDTO } from "../dto/ModelDTO";

export const ModelMapper = {
  toDTO(model: Model): ModelDTO {
    return {
      id: model.id,
      name: model.name,
      role: model.role,
      bio: model.bio,
      photo: model.photo,
      instagram: model.instagram,
      featured: model.featured,
      createdAt: model.createdAt.toISOString(),
    };
  },
  toDTOList(models: Model[]): ModelDTO[] {
    return models.map((m) => ModelMapper.toDTO(m));
  },
};
