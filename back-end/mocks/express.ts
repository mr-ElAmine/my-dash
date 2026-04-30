import { vi, type Mock } from "vitest";

export interface MockResponse {
  status: Mock<(code: number) => MockResponse>;
  json: Mock<(body: unknown) => MockResponse>;
  setHeader: Mock<(name: string, value: string) => MockResponse>;
  send: Mock<(body: unknown) => MockResponse>;
}

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

export function createMockRequest(params: Record<string, string> = {}) {
  return { params };
}
