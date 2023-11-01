import { getServerSession } from '#auth'
import { User } from '../lib/models/User'

const pathes: string[] = [
    '/api/delivery/get'
]

export default eventHandler(async (event) => {

    const { pathname } = getRequestURL(event)

    if(pathes.includes( pathname )) {
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        
        const user = await User.findOne({ uuid: session.uuid })
        if (!user) return sendRedirect(event, '/auth', 302)
        
        let company
        if (user.uuidCompany) {
            company = await User.findOne({ uuid: user.uuidCompany })
        }else{
            company = user
        }        
        event.context.company = JSON.stringify(company)
    }
})
