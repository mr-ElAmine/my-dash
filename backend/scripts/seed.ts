import { faker } from "@faker-js/faker";
import bcryptjs from "bcryptjs";
import { db } from "../src/db/client";
import { users } from "../src/db/schema/users.schema";
import { organizations } from "../src/db/schema/organizations.schema";
import { organizationMembers } from "../src/db/schema/organization-members.schema";

async function seed() {
  console.log("Seeding database...\n");

  const passwordHash = await bcryptjs.hash("password123", 10);

  const [user] = await db
    .insert(users)
    .values({
      email: "admin@mydash.local",
      passwordHash,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: faker.phone.number({ style: "national" }),
    })
    .returning();

  console.log("User created:");
  console.log(`  email:    ${user.email}`);
  console.log(`  password: password123`);
  console.log(`  id:       ${user.id}\n`);

  const [org] = await db
    .insert(organizations)
    .values({
      name: faker.company.name(),
      legalName: faker.company.name(),
      email: faker.internet.email(),
      phone: faker.phone.number({ style: "national" }),
      siren: faker.string.numeric(9),
      billingStreet: faker.location.streetAddress(),
      billingCity: faker.location.city(),
      billingZipCode: faker.location.zipCode(),
      billingCountry: "FR",
    })
    .returning();

  console.log("Organization created:");
  console.log(`  name: ${org.name}`);
  console.log(`  id:   ${org.id}\n`);

  await db.insert(organizationMembers).values({
    organizationId: org.id,
    userId: user.id,
    role: "owner",
  });

  console.log("User linked to organization as owner.\n");
  console.log("Done.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
