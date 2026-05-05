import { describe, it, expect } from "vitest";
import { buildClientSnapshot, buildIssuerSnapshot } from "../../../src/utils/snapshots";
import { createCompany } from "../../fixtures/companies.fixture";
import { createOrganization } from "../../fixtures/organizations.fixture";

describe("snapshots utils", () => {
  describe("buildClientSnapshot", () => {
    it("should build snapshot from company", () => {
      const company = createCompany({
        name: "Acme",
        billingStreet: "1 rue de la Paix",
        billingCity: "Paris",
        billingZipCode: "75001",
        billingCountry: "FR",
      });

      const snapshot = buildClientSnapshot(company);
      expect(snapshot.name).toBe("Acme");
      expect(snapshot.billingStreet).toBe("1 rue de la Paix");
      expect(snapshot.billingCity).toBe("Paris");
      expect(snapshot.billingZipCode).toBe("75001");
      expect(snapshot.billingCountry).toBe("FR");
    });

    it("should include contact info when provided", () => {
      const company = createCompany();
      const contact = {
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean@acme.com",
        phone: "+33612345678",
        jobTitle: "CEO",
      };

      const snapshot = buildClientSnapshot(company, contact);
      expect(snapshot.contactFirstName).toBe("Jean");
      expect(snapshot.contactLastName).toBe("Dupont");
      expect(snapshot.contactEmail).toBe("jean@acme.com");
    });

    it("should work without contact", () => {
      const company = createCompany();
      const snapshot = buildClientSnapshot(company);
      expect(snapshot.contactFirstName).toBeUndefined();
    });
  });

  describe("buildIssuerSnapshot", () => {
    it("should build snapshot from organization", () => {
      const org = createOrganization({
        name: "My Company",
        legalName: "My Company SAS",
        siren: "123456789",
        siret: "12345678900012",
        vatNumber: "FR123456789",
        billingStreet: "10 rue Exemple",
        billingCity: "Lyon",
        billingZipCode: "69001",
        billingCountry: "FR",
        email: "info@mycompany.fr",
        phone: "+33412345678",
      });

      const snapshot = buildIssuerSnapshot(org);
      expect(snapshot.name).toBe("My Company");
      expect(snapshot.legalName).toBe("My Company SAS");
      expect(snapshot.siren).toBe("123456789");
      expect(snapshot.vatNumber).toBe("FR123456789");
      expect(snapshot.billingStreet).toBe("10 rue Exemple");
    });
  });
});
