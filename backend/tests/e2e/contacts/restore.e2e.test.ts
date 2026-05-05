import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeContact, createTestToken } from "../helpers";

vi.mock("../../../src/services/contacts.service");
vi.mock("../../../src/middlewares/organization-access.middleware");
vi.mock("../../../src/middlewares/role.middleware");

import { mockRestore } from "../../../src/services/__mocks__/contacts.service";

describe("POST /api/organizations/:orgId/contacts/:contactId/restore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should restore contact and return 200", async () => {
    const contact = createSafeContact({ status: "active" });
    mockRestore.mockResolvedValue(contact);

    const res = await request(app)
      .post("/api/organizations/org_1/contacts/contact_1/restore")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(contact);
    expect(mockRestore).toHaveBeenCalledWith({
      organizationId: "org_1",
      contactId: "contact_1",
      userId: "user_1",
    });
  });
});
