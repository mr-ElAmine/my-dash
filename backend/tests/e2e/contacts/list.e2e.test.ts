import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeContact, createTestToken } from "../helpers";

vi.mock("../../../src/services/contacts.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockList } from "../../../src/services/__mocks__/contacts.service";

describe("GET /api/organizations/:orgId/contacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return paginated contact list", async () => {
    const contact = createSafeContact();
    mockList.mockResolvedValue({
      data: [contact],
      pagination: { page: 1, limit: 20, total: 1 },
    });

    const res = await request(app)
      .get("/api/organizations/org_1/contacts")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([contact]);
    expect(res.body.pagination).toEqual({ page: 1, limit: 20, total: 1 });
  });

  it("should forward query params to service", async () => {
    mockList.mockResolvedValue({
      data: [],
      pagination: { page: 1, limit: 20, total: 0 },
    });

    await request(app)
      .get("/api/organizations/org_1/contacts?status=active&companyId=comp_1&search=marie")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org_1",
        status: "active",
        companyId: "comp_1",
        search: "marie",
      }),
    );
  });
});
