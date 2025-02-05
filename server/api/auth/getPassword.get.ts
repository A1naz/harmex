import generator from 'generate-password'

export default eventHandler(async (event) => {
        const password = generator.generate({
                length: 12,
                numbers: true,
                symbols: false,
                uppercase: true,
                excludeSimilarCharacters: true,
                strict: true,
        })

        console.log(password)
        return password
})