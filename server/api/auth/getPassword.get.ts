import generator from 'generate-password'

export default eventHandler(async (event) => {
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