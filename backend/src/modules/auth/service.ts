import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config.js';
import { EmailTakenError, InvalidCredentialsError, UnauthorizedError } from '../../lib/errors.js';
import { RegisterInput, LoginInput } from './schemas.js';
import * as authRepo from './repository.js';

export interface UserDto {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function toUserDto(row: authRepo.UserRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.created_at.toISOString(),
  };
}

export function generateToken(userId: number): string {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function register(input: RegisterInput): Promise<{ user: UserDto; token: string }> {
  const existing = await authRepo.findUserByEmail(input.email);
  if (existing) {
    throw new EmailTakenError();
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userRow = await authRepo.createUser(input.name, input.email, passwordHash);
  const token = generateToken(userRow.id);

  return {
    user: toUserDto(userRow),
    token,
  };
}

export async function login(input: LoginInput): Promise<{ user: UserDto; token: string }> {
  const userRow = await authRepo.findUserByEmail(input.email);
  if (!userRow) {
    throw new InvalidCredentialsError();
  }

  const match = await bcrypt.compare(input.password, userRow.password_hash);
  if (!match) {
    throw new InvalidCredentialsError();
  }

  const token = generateToken(userRow.id);

  return {
    user: toUserDto(userRow),
    token,
  };
}

export async function getMe(userId: number): Promise<{ user: UserDto }> {
  const userRow = await authRepo.findUserById(userId);
  if (!userRow) {
    throw new UnauthorizedError('User account not found');
  }

  return {
    user: toUserDto(userRow),
  };
}
