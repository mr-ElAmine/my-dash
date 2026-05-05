export type ValidationDetail = {
  field: string;
  message: string;
};

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details?: ValidationDetail[],
  ) {
    super(message);
    this.name = "AppError";
  }
}
