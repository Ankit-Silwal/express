import bcrypt from 'bcrypt';
const saltRounds = 10;

export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
}
export const comparePassword=(plain,hashed)=>{
  return bcrypt.compareSync(plain,hashed);
}