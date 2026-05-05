import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeContact, createTestToken } from "../helpers";

vi.mock("../../../src/services/contacts.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockGetById } from "../../../src/services/__mocks__/contacts.service";

describe("GET /api/organizations/:orgId/contacts/:contactId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return contact by id", async () => {
    const contact = createSafeContact();
    mockGetById.mockResolvedValue(contact);

    const res = await request(app)
      .get("/api/organizations/org_1/contacts/contact_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(contact);
    expect(mockGetById).toHaveBeenCalledWith({
      organizationId: "org_1",
      contactId: "contact_1",
      userId: "user_1",
    });
  });
});
