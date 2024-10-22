import { generateUsername } from 'unique-username-generator'
import { User } from '~/server/lib/models/User'

export async function generateUniqueUsername(): Promise<string> {
  let username = generateRandomUsername()
  let isUnique = false
  while (!isUnique) {
    const existingUser = await User.findOne({ username })
    if (!existingUser) {
      isUnique = true
      break
    }
    username = generateRandomUsernameWithDigits()
  }
  return username
}

function generateRandomUsername(): string {
  const randomName = generateUsername('', 0, 10)
  return randomName
}
function generateRandomUsernameWithDigits(): string {
  const randomName = generateUsername('', 2, 10)
  return randomName
}
