import bcrypt from 'bcrypt';
const saltRounds = 10;

export async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return await bcrypt.hash(password, saltRounds);
}