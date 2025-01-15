import { View } from '~/server/lib/models/wildberries/View'

export default eventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user)
                return sendRedirect(event, '/auth', 302)

        const { id } = getQuery(event)
        const foundView = await View.findById(id)

        if (!foundView)
                throw createError({
                        statusCode: 400,
                        message: 'Просмотр не найден',
                })

        return foundView.uuid
})
