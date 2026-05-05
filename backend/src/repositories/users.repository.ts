import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, type User, type NewUser } from "../db/schema/users.schema";

export interface IUsersRepository {
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(data: NewUser): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;
}

export class UsersRepository implements IUsersRepository {
  constructor(private database: typeof db = db) {}

  async findById(id: string): Promise<User | undefined> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.database
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async create(data: NewUser): Promise<User> {
    const [user] = await this.database.insert(users).values(data).returning();
    return user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.database
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
