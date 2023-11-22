import { User } from '~~/server/lib/models/User'

export async function createUsername(email: string): Promise<string> {
    let userName = email.split('@')[0].replaceAll('.', '').replaceAll('-', '_')
    const findUsernames = await User.find(
        { username: { $regex: '^' + userName, $options: 'i' } },
        { username: 1, _id: 0 }
    ).lean()
    if (findUsernames.length > 0) {
        const usernames = findUsernames.map(user => user.username)
        if (usernames.includes(userName)) {
            let start = 1
            let userNickToCheck = userName.toString()
            while (usernames.includes(userNickToCheck + '_' + start)) {
                start++
            }
            userName = userNickToCheck + '_' + start
        }
    }
    return userName
}
