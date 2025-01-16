function getServiceLink(type: string, mp: string, uuid: string) {
        
        switch (type) {
                // case 'likeProduct': return 'productlikes'
                case 'viewing': return `NUXTLINK||/${mp}/viewings?id=${uuid}||${uuid}`
                // case 'likeReview': return 'likes'
                // case 'cart': return 'carts'
                // case 'questionProduct': return 'questions'
                // case 'buyout': return 'buyouts'
                case 'review': return `NUXTLINK||/${mp}/reviews?status=all&uuid=${uuid.replace('Отзыв #', '')}&mp=${mp}||${uuid}`
                case 'reviews': return `NUXTLINK||/${mp}/reviews?status=all&uuid=${uuid.replace('Отзыв #', '')}&mp=${mp}||${uuid}`
                default: return ''
        }
}

export default function getBuyoutLink(mp: string, uuid: string, type: string = 'buyout') {
        if (type == 'buyout' || type == 'buyouts service' || type == 'buyouts') {
                return `NUXTLINK||/${mp}/buyouts?uuid=${uuid.replace('Выкуп #', '')}||Выкуп #${uuid}`
        } else {
                const serviceLink = getServiceLink(type, mp, uuid)
                if (!serviceLink) return uuid
                return serviceLink
        }
}