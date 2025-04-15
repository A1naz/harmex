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
  return username.replace(/[^a-zA-Z0-9_]/g, '')
}

function generateRandomUsername(): string {
  const randomName = generateUsername('', 0, 10)
  return randomName.replace(/[^a-zA-Z0-9_]/g, '')
}
function generateRandomUsernameWithDigits(): string {
  const randomName = generateUsername('', 2, 10)
  return randomName.replace(/[^a-zA-Z0-9_]/g, '')
}
