import { User } from '@/server/lib/models/User'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'
import jwt from 'jsonwebtoken'
const runtimeConfig = useRuntimeConfig()
const nuxtAuthCookieName = runtimeConfig.SESSION_TOKEN
const jwtSecret = runtimeConfig.SECRET
import user from '~~/server/utils/auth';

export default eventHandler(async (event) => {
  const userAuth = await user.user(event)
  // console.log('userAuth', userAuth);
  const foundedUser = await User.findOne({ uuid: userAuth.uuid })
  // console.log('user', foundedUser);

  if (!foundedUser) return sendRedirect(event, '/auth', 302)

  const { changeTo } = getQuery(event)

  if (foundedUser.isTwoFaEnabled) {
    foundedUser.isTwoFaEnabled = false;
  } else {
    console.log('changeTo', changeTo);
    foundedUser.isTwoFaEnabled = changeTo;
  }
   await foundedUser.save()
  console.log('foundedUser.isTwoFaEnabled', foundedUser.isTwoFaEnabled);

  return {
    status: 'ok',
  }
})
