import { Search } from '~/server/lib/models/Search'

export default defineEventHandler(async (event) => {
        const { title, path, phrases } = await readBody(event)
        await Search.create({ title, path, phrases })
        return { status: 'ok' }
})