import { User } from "./User";

/**
 * UserRepository — domain "port" (interface).
 * Infrastructure provides adapters (in-memory, Prisma/MySQL).
 */
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
