const useValidation = () => {

    const restrictUrl = (text: string): boolean => {  // hi http

        if (text.length < 1) return true

        const textPrepare = text.toLowerCase()
        const divider = [',', ':', '.', '-', '/', '//', ' ', '\n']
        var acc = ''
        const forbbiden = ['http', 'www', '//', 'ru' ]

        for(let i=0; i<=textPrepare.length-1; i++){
            const char = textPrepare[i]
            if (divider.includes(char)) {
                if (forbbiden.includes(acc)) return false
                else acc =''
            } else {
                acc += char 
            }
            if (i == textPrepare.length-1) {
                if (forbbiden.includes(acc)) return false
            }
        }
        return true
    }
    return {
        restrictUrl
    }
}


export default useValidation