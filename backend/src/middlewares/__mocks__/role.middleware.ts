export function requireRole(..._roles: string[]) {
  return (_req: unknown, _res: unknown, next: () => void): void => {
    next();
  };
}
