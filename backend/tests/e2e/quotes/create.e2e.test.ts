import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { authHeaders, createSafeQuote } from "../helpers";
import { AppError } from "../../../src/errors/app-error";
vi.mock("../../../src/services/quotes.service");

import { mockCreate } from "../../../src/services/__mocks__/quotes.service";

vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

describe("POST /api/organizations/:organizationId/quotes", () => {
  const orgId = "org_1";
  const userId = "user_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a quote and return 201", async () => {
    const quote = createSafeQuote();
    mockCreate.mockResolvedValue(quote);

    const body = {
      companyId: "comp_1",
      issueDate: "2026-05-03",
      validUntil: "2026-06-03",
    };

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: quote });
    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
      companyId: "comp_1",
      contactId: undefined,
      issueDate: "2026-05-03",
      validUntil: "2026-06-03",
    });
  });

  it("should create a quote with optional contactId", async () => {
    const quote = createSafeQuote({ contactId: "contact_1" });
    mockCreate.mockResolvedValue(quote);

    const body = {
      companyId: "comp_1",
      contactId: "contact_1",
      issueDate: "2026-05-03",
      validUntil: "2026-06-03",
    };

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ data: quote });
    expect(mockCreate).toHaveBeenCalledWith({
      organizationId: orgId,
      userId,
      companyId: "comp_1",
      contactId: "contact_1",
      issueDate: "2026-05-03",
      validUntil: "2026-06-03",
    });
  });

  it("should return 422 when companyId is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send({ issueDate: "2026-05-03", validUntil: "2026-06-03" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "companyId" }),
      ]),
    );
  });

  it("should return 422 when issueDate is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send({ companyId: "comp_1", validUntil: "2026-06-03" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "issueDate" }),
      ]),
    );
  });

  it("should return 422 when validUntil is missing", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send({ companyId: "comp_1", issueDate: "2026-05-03" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "validUntil" }),
      ]),
    );
  });

  it("should return 422 when body is empty", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when no auth token is provided", async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .send({ companyId: "comp_1", issueDate: "2026-05-03", validUntil: "2026-06-03" });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("should handle service error", async () => {
    mockCreate.mockImplementation(() => {
      throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
    });

    const res = await request(app)
      .post(`/api/organizations/${orgId}/quotes`)
      .set(authHeaders(userId))
      .send({ companyId: "comp_1", issueDate: "2026-05-03", validUntil: "2026-06-03" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("COMPANY_NOT_FOUND");
    expect(res.body.error.message).toBe("Company not found");
  });
});
