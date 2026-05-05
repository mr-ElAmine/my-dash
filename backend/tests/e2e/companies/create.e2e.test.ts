import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeCompany, createTestToken } from "../helpers";

vi.mock("../../../src/services/companies.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockCreate } from "../../../src/services/__mocks__/companies.service";

describe("POST /api/organizations/:orgId/companies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject when name is missing", async () => {
    const res = await request(app)
      .post("/api/organizations/org_1/companies")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "name" })]),
    );
  });

  it("should create company and return 201", async () => {
    const company = createSafeCompany();
    mockCreate.mockResolvedValue(company);

    const res = await request(app)
      .post("/api/organizations/org_1/companies")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({
        name: "Test Company",
        siren: "123456789",
        industry: "Tech",
        billingCity: "Paris",
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual(company);
  });

  it("should forward all fields to service", async () => {
    const company = createSafeCompany();
    mockCreate.mockResolvedValue(company);

    await request(app)
      .post("/api/organizations/org_1/companies")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({
        name: "Test Company",
        siren: "123456789",
        billingCity: "Paris",
      });

    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: "org_1",
      userId: "user_1",
      name: "Test Company",
      siren: "123456789",
      siret: undefined,
      vatNumber: undefined,
      industry: undefined,
      website: undefined,
      billingStreet: undefined,
      billingCity: "Paris",
      billingZipCode: undefined,
      billingCountry: undefined,
    });
  });

  it("should create company with minimal fields", async () => {
    const company = createSafeCompany();
    mockCreate.mockResolvedValue(company);

    const res = await request(app)
      .post("/api/organizations/org_1/companies")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ name: "Acme" });

    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Acme" }),
    );
  });
});
