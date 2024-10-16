import { User } from '~~/server/lib/models/User'
import auth from '~~/server/utils/auth'
export default defineEventHandler(async (event) => {
  const { phoneNumber, password } = await readBody(event)
  await auth.attempt(event, phoneNumber, password)
  
  return 'success'
})
