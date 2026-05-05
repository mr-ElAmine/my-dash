import type { User } from "../db/schema/users.schema";
import type { IUsersRepository } from "../repositories/users.repository";
import type { IPasswordService } from "./password.service";
import type { IJwtService } from "./jwt.service";
import { UsersRepository } from "../repositories/users.repository";
import { PasswordService } from "./password.service";
import { JwtService } from "./jwt.service";
import { AppError } from "../errors/app-error";

type SafeUser = Omit<User, "passwordHash">;

function stripPasswordHash(user: User): SafeUser {
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
}

export interface IAuthService {
  register(input: RegisterInput): Promise<AuthResult>;
  login(input: LoginInput): Promise<AuthResult>;
  getMe(userId: string): Promise<SafeUser>;
}

export class AuthService implements IAuthService {
  constructor(
    private usersRepo: IUsersRepository = new UsersRepository(),
    private passwordService: IPasswordService = new PasswordService(),
    private jwtService: IJwtService = new JwtService(),
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await this.usersRepo.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
    }

    const passwordHash = await this.passwordService.hash(input.password);

    const user = await this.usersRepo.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    const accessToken = this.jwtService.signAccessToken({ userId: user.id });

    return {
      user: stripPasswordHash(user),
      accessToken,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.usersRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (user.status === "disabled") {
      throw new AppError("Account is disabled", 403, "ACCOUNT_DISABLED");
    }

    const valid = await this.passwordService.verify(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    await this.usersRepo.updateLastLogin(user.id);

    const accessToken = this.jwtService.signAccessToken({ userId: user.id });

    return {
      user: stripPasswordHash(user),
      accessToken,
    };
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return stripPasswordHash(user);
  }
}
