import type { H3Event } from 'h3'
import { User } from '~~/server/lib/models/User'
import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { generateUniqueUsername } from './createUsername'
const config = useRuntimeConfig()
// Logs the user in as the given user model
async function login(event: H3Event<Request>, user: IUser) {
  await replaceUserSession(event, {
    user: {
      uuid: user.uuid,
      phoneNumber: user.phoneNumber,
      email: user.email ? user.email : '',
      emailConfirmed: user.emailConfirmed,
      isTwoFaEnabled: user.isTwoFaEnabled,
      acesses: user.acesses,
      username: user.username,
      balance: user.balance,
      fizFace: user.fizFace,
      orgInn: user.orgInn,
      orgName: user.orgName,
      ffEnabled: user.ffEnabled
    },
    twoFaNeeded: user.isTwoFaEnabled,
    loggedInAt: new Date(),
  })
}

async function registerUser(
  event: H3Event<Request>,
  data: { phoneNumber: string, password: string },
) {
  const { phoneNumber, password } = data
  if (!phoneNumber || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid phoneNumber or password',
    })
  }
  else {
    const hashedPassword = bcrypt.hashSync(password, 7)
    const username = await generateUniqueUsername()
    const user = await User.create({
      phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
      password: hashedPassword,
      username,
      uuid: uuid(),
    })
    await login(event, user)
  }
}

async function changePassword(
  event: H3Event<Request>,
  data: { phoneNumber: string, newPassword: string },
) {
  const { phoneNumber, newPassword } = data
  if (!phoneNumber || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid phoneNumber or newPassword',
    })
  }
  else {
    const found = await User.findOne({
      phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
    })
    if (!found) {
      throw createError({
        statusCode: 404,
        message: 'User not found',
      })
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 7)
    await User.updateOne(
      { phoneNumber: phoneNumber.replace(/[()\-\s]/g, '') },
      { $set: { password: hashedPassword } },
    )
  }
}

async function getCurrentUser(event: H3Event<Request>) {
  const session = await getUserSession(event)

  // return null if there's no user
  if (!session.user) {
    return null
  }
  const dbUser = await User.findOne({ uuid: session.user.uuid }).select('-password')
  // we're getting the whole user object by default for convenience, but always remove the password
  const result = dbUser?.toObject()
  if (!result)
    return null
  return result
}

async function attempt(
  event: H3Event<Request>,
  phoneNumber: string,
  password: string,
) {
  // console.log('attempt', phoneNumber, password)

  const foundUser = await User.findOne({
    phoneNumber: phoneNumber.replace(/[()\-\s]/g, ''),
  })

  if (!foundUser) {
    throw createError({
      statusCode: 401,
      message: 'Неверный логин или пароль.',
    })
  }

  const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
  if (
    !isPasswordCorrect
    // && config.env !== "developer"
  ) {
    // return an error if the user is not found or the password doesn't match
    throw createError({
      statusCode: 401,
      message: 'Неверный логин или пароль.',
    })
  }

  // log in as the selected user
  await login(event, foundUser)

  return true
}

export default {
  login,
  user: getCurrentUser,
  attempt,
  registerUser,
  changePassword,
}
