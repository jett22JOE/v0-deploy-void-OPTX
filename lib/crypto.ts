import { argon2id } from "argon2"

export async function hashPin(pin: string, salt: string) {
  return argon2id.hash(pin, { salt, timeCost: 3, memoryCost: 64 * 1024 })
}

