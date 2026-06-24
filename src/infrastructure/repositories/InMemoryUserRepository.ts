import { User } from "@/domain/user/User";
import { UserRepository } from "@/domain/user/UserRepository";
import { hashPassword } from "@/lib/hash";

/**
 * InMemoryUserRepository — adapter used when DATA_SOURCE="memory".
 * Seeds a default admin user so login works without any database.
 */
const store: Map<string, User> = new Map();

function seed() {
  if (store.size > 0) return;
  const admin = new User({
    id: "u-admin",
    name: "ABYSS Admin",
    email: "admin@abyss.com",
    passwordHash: hashPassword("admin123"),
    role: "admin",
    createdAt: new Date("2025-01-01"),
  });
  store.set(admin.id, admin);
}

seed();

export class InMemoryUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return store.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const lower = email.toLowerCase();
    return (
      Array.from(store.values()).find((u) => u.email === lower) ?? null
    );
  }

  async create(user: User): Promise<User> {
    store.set(user.id, user);
    return user;
  }
}
