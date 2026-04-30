import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { contacts } from "../entity/contact";

export class ContactRepository {
  async findById(id: number) {
    return db.select().from(contacts).where(eq(contacts.id, id)).get();
  }

  async findList() {
    return this.db.query.contacts.findMany({
      with: {
        company: { columns: { id: true, name: true } },
      },
    });
  }

  async findDetail(id: number) {
    return this.db.query.contacts.findFirst({
      where: eq(contacts.id, id),
      with: {
        company: true,
      },
    });
  }
}
