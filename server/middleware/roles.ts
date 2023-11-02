import { User } from '../lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'

export default eventHandler( async (event) => {

    // const { pathname } = getRequestURL(event)

    // const session = (await getServerSession(event)) as any
    // if (!session) return sendRedirect(event, '/auth', 302)
    
    // const user = await User.findOne({ uuid: session.uuid })
    // if (!user) return sendRedirect(event, '/auth', 302)
    
    // const { pathes } = user.uuidCompany ? MenuBuilder.filteredAccess(user.acesses) : MenuBuilder.fullAccess()

    // if(pathes){
    //     if(!pathes.includes(pathname)) {
    //         return sendRedirect(event, '/auth', 302)
    //     } 
    // }

})
