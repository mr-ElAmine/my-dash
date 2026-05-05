import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../../src/app";
import { createSafeContact, createTestToken } from "../helpers";

vi.mock("../../../src/services/contacts.service");
vi.mock("../../../src/middlewares/organization-access.middleware");

import { mockUpdate } from "../../../src/services/__mocks__/contacts.service";

describe("PATCH /api/organizations/:orgId/contacts/:contactId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update contact and return 200", async () => {
    const contact = createSafeContact({ firstName: "Updated" });
    mockUpdate.mockResolvedValue(contact);

    const res = await request(app)
      .patch("/api/organizations/org_1/contacts/contact_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ firstName: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(contact);
  });

  it("should forward partial data to service", async () => {
    const contact = createSafeContact();
    mockUpdate.mockResolvedValue(contact);

    await request(app)
      .patch("/api/organizations/org_1/contacts/contact_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ firstName: "Updated", email: "new@example.com" });

    expect(mockUpdate).toHaveBeenCalledWith({
      organizationId: "org_1",
      contactId: "contact_1",
      userId: "user_1",
      data: { firstName: "Updated", email: "new@example.com" },
    });
  });

  it("should reject invalid email", async () => {
    const res = await request(app)
      .patch("/api/organizations/org_1/contacts/contact_1")
      .set("Authorization", `Bearer ${createTestToken("user_1")}`)
      .send({ email: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
