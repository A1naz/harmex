import { User } from '~~/server/lib/models/User'
import { generateUsername } from 'unique-username-generator'

export async function createUsername(email: string): Promise<string> {
  let userName = email.split('@')[0].replaceAll('.', '').replaceAll('-', '_')

  if (/^\d+$/.test(userName)) {
    userName = generateUsername('', 0, 10)
    let isUnique = false
    while (!isUnique) {
      const existingUser = await User.findOne({ username: userName })
      if (!existingUser) {
        isUnique = true
        break
      }
      userName = generateUsername('', 0, 10)
    }
    userName = userName.replace(/[^a-zA-Z0-9_]/g, '')
  }

  const findUsernames = await User.find(
    { username: { $regex: `^${userName}`, $options: 'i' } },
    { username: 1, _id: 0 },
  ).lean()
  if (findUsernames.length > 0) {
    const usernames = findUsernames.map(user => user.username)
    if (usernames.includes(userName)) {
      let start = 1
      const userNickToCheck = userName.toString()
      while (usernames.includes(`${userNickToCheck}_${start}`)) {
        start++
      }
      userName = `${userNickToCheck}_${start}`
    }
  }
  return userName.replace(/[^a-zA-Z0-9_]/g, '')
}
