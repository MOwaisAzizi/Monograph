import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

export const isCorrectPassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};
