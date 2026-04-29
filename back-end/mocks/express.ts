import { vi, type Mock } from "vitest";

/**
 * Faux objet Response Express, conçu pour les tests unitaires.
 *
 * Chaque méthode est un spy Vitest qu'on peut vérifier avec :
 *   expect(res.status).toHaveBeenCalledWith(200)
 *
 * Le chaînage Express fonctionne car chaque spy renvoie l'objet
 * complet via mockReturnValue(res).
 */
export interface MockResponse {
  status: Mock<(code: number) => MockResponse>;
  json: Mock<(body: unknown) => MockResponse>;
  setHeader: Mock<(name: string, value: string) => MockResponse>;
  send: Mock<(body: unknown) => MockResponse>;
}

/**
 * Construit un faux objet Response sans aucun cast de type.
 *
 * On crée d'abord les fonctions mock, puis l'objet qui les regroupe,
 * puis on les chaîne pour que chaque méthode renvoie l'objet complet.
 */
export function createMockResponse(): MockResponse {
  const status = vi.fn<(code: number) => MockResponse>();
  const json = vi.fn<(body: unknown) => MockResponse>();
  const setHeader = vi.fn<(name: string, value: string) => MockResponse>();
  const send = vi.fn<(body: unknown) => MockResponse>();

  const res: MockResponse = { status, json, setHeader, send };

  status.mockReturnValue(res);
  json.mockReturnValue(res);
  setHeader.mockReturnValue(res);
  send.mockReturnValue(res);

  return res;
}

/** Construit un faux objet Request avec les params souhaités. */
export function createMockRequest(params: Record<string, string> = {}) {
  return { params };
}
