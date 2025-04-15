import { generateUniqueUsername } from '~/server/utils/createUsername'

export default eventHandler(async (event) => {
    const username = await generateUniqueUsername()

    return username
})