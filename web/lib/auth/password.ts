import bcrypt from "bcryptjs";

export const PASSWORD_MIN = 12;
const COST = 12;

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, COST);
}

export function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
