import { getServices } from "@/infrastructure/container";

export const ModelController = {
  async index(featuredOnly = false) {
    const { modelService } = getServices();
    return modelService.list(featuredOnly);
  },
  async show(id: string) {
    const { modelService } = getServices();
    return modelService.getById(id);
  },
};
