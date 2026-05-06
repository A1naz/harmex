import generator from 'generate-password'

export default eventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user)
                return sendRedirect(event, '/auth', 302)

        const password = generator.generate({
                length: 16,
                numbers: true,
                symbols: true,
                uppercase: true,
                excludeSimilarCharacters: true,
                strict: true,
        })

        return password
})