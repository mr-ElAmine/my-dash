import { eq } from "drizzle-orm";
import { db } from "../entity/db";
import { companies } from "../entity/company";

export class CompanyRepository {
  async findById(id: number) {
    return db.select().from(companies).where(eq(companies.id, id)).get();
  }
}
