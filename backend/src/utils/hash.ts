import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export const hashPassword = async (plainPassword: string) => {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS)
}

export const comparePasswords = async (plainPassword: string, hashedPassword: string) => {
  return await bcrypt.compare(plainPassword, hashedPassword)
}
