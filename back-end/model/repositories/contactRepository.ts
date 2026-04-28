import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { contacts } from "../entity/contact";

export class ContactRepository {
  private db = db;

  async findById(id: number) {
    return this.db.select().from(contacts).where(eq(contacts.id, id)).get();
  }
}
