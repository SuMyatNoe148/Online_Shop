import { getServices } from "@/infrastructure/container";
import { LoginDTO, RegisterDTO } from "@/application/dto/UserDTO";

/**
 * AuthController — validates input and delegates to AuthService.
 */
export const AuthController = {
  async login(body: LoginDTO) {
    const { authService } = getServices();
    return authService.login(body);
  },

  async register(body: RegisterDTO) {
    const { authService } = getServices();
    return authService.register(body);
  },
};
