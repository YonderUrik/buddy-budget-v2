import * as bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @returns The hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a password against a hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
} 