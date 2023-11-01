import { getServerSession } from '#auth'
import { User } from '../lib/models/User'


export const getAdminEntity = async (event: any): Promise<IUser> => {

    const session = (await getServerSession(event)) as any
    if (!session) return sendRedirect(event, '/auth', 302)
    
    const user = await User.findOne({ uuid: session.uuid })
    if (!user) return sendRedirect(event, '/auth', 302)
    
    let company: IUser
    if (user.uuidCompany) {
        company = await User.findOne({ uuid: user.uuidCompany })
    }else{
        company = user
    }        
    return company
}
