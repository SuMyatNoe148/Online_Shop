import { User } from "@/domain/user/User";
import { UserRepository } from "@/domain/user/UserRepository";
import { UserDTO, LoginDTO, RegisterDTO } from "../dto/UserDTO";
import { hashPassword, verifyPassword } from "@/lib/hash";
import { createId } from "@/lib/id";

/**
 * AuthService — application service for authentication use cases.
 */
export class AuthService {
  constructor(private readonly repo: UserRepository) {}

  async login(dto: LoginDTO): Promise<UserDTO> {
    const user = await this.repo.findByEmail(dto.email.toLowerCase());
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new Error("Invalid email or password.");
    }
    return { id: user.id, name: user.name, role: user.role };
  }

  async register(dto: RegisterDTO): Promise<UserDTO> {
    if (!dto.name?.trim()) throw new Error("Name is required.");
    if (!dto.email?.trim()) throw new Error("Email is required.");
    if (!dto.password || dto.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const existing = await this.repo.findByEmail(dto.email.toLowerCase());
    if (existing) throw new Error("Email already registered.");

    const user = new User({
      id: createId(),
      name: dto.name.trim(),
      email: dto.email.toLowerCase().trim(),
      passwordHash: hashPassword(dto.password),
      role: "customer",
      createdAt: new Date(),
    });

    await this.repo.create(user);
    return { id: user.id, name: user.name, role: user.role };
  }
}
