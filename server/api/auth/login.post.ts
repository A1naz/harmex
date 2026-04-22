import { User } from '~~/server/lib/models/User'
// import auth from '~~/server/utils/auth'
export default defineEventHandler(async (event) => {
  const { contact, password } = await readBody(event)
  await auth.attempt(event, contact, password)
  
  return 'success'
})
