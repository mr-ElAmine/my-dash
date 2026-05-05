import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeContact, createTestToken } from "../helpers";

vi.mock("../../../src/services/contacts.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockCreate } from "../../../src/services/__mocks__/contacts.service";

describe("POST /api/organizations/:orgId/contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/contacts")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "companyId" }),
        expect.objectContaining({ field: "firstName" }),
        expect.objectContaining({ field: "lastName" }),
      ]),
    );
  });

  it("should create contact and return 201", async () => {
    const contact = createSafeContact();
    mockCreate.mockResolvedValue(contact);

    const res = await request(app)
      .post("/api/organizations/org_1/contacts")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({
        companyId: "comp_1",
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie@example.com",
        phone: "0600000000",
        jobTitle: "CEO",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(contact);
  });

  it("should forward all fields to service", async () => {
    const contact = createSafeContact();
    mockCreate.mockResolvedValue(contact);

    await request(app)
      .post("/api/organizations/org_1/contacts")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({
        companyId: "comp_1",
        firstName: "Marie",
        lastName: "Dupont",
        email: "marie@example.com",
      });

    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: "org_1",
      userId: "user_1",
      companyId: "comp_1",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie@example.com",
      phone: undefined,
      jobTitle: undefined,
    });
  });

  it("should reject invalid email", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/contacts")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({
        companyId: "comp_1",
        firstName: "Marie",
        lastName: "Dupont",
        email: "not-an-email",
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
