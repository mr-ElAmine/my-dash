import bcryptjs from "bcryptjs";
import { db } from "../src/db/client";
import { users } from "../src/db/schema/users.schema";

const EMAIL = process.env.SEED_EMAIL ?? "admin@mydash.local";
const PASSWORD = process.env.SEED_PASSWORD ?? "password123";
const FIRST_NAME = process.env.SEED_FIRST_NAME ?? "Admin";
const LAST_NAME = process.env.SEED_LAST_NAME ?? "MyDash";
const PHONE = process.env.SEED_PHONE ?? "06 00 00 00 00";

async function seedProd() {
  console.log("🌱 Seeding prod user...\n");

  const passwordHash = await bcryptjs.hash(PASSWORD, 10);

  const [user] = await db
    .insert(users)
    .values({
      email: EMAIL,
      passwordHash,
      firstName: FIRST_NAME,
      lastName: LAST_NAME,
      phone: PHONE,
    })
    .returning();

  console.log("✅ User created:");
  console.log(`   email:    ${user.email}`);
  console.log(`   password: ${PASSWORD}`);
  console.log(`   id:       ${user.id}`);
  process.exit(0);
}

seedProd().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
