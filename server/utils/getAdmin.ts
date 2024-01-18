import { getServerSession } from '#auth'
import { User } from '../lib/models/User'


export const getAdminEntity = async (event: any): Promise<IUser | void> => {

    try{
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        
        const user = await User.findOne({ uuid: session.uuid })
        if (!user) return sendRedirect(event, '/auth', 302)


        if (user.uuidCompany) {
            const admin = await User.findOne({ uuid: user.uuidCompany })
            if (!admin) return sendRedirect(event, '/auth', 302)
            return admin
        } else {
            return user
        }    
    }    
    catch(e:any){
        return sendRedirect(event, '/auth', 302)
    }
}
