function getServiceLink(type: string) {
        switch (type) {
                case 'likeProduct': return 'productlikes'
                case 'viewing': return 'viewings'
                case 'likeReview': return 'likes'
                case 'cart': return 'carts'
                case 'questionProduct': return 'questions'
                case 'buyout': return 'buyouts'
                case 'review': return 'reviews'
                default: return ''
        }
}

export default function getBuyoutLink(mp: string, uuid: string, type: string = 'buyout') {
        if (type == 'buyout') {
                return `NUXTLINK||/${mp}/buyouts?uuid=${uuid}||Выкуп #${uuid}`
        } else {
                const service = getServiceLink(type)
                if (!service) return uuid
                return `NUXTLINK||/${mp}/${service}?uuid=${uuid}&mp=${mp}||#${uuid}`
        }
}