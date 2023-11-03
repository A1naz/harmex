import { User } from '../lib/models/User'
import { getServerSession } from '#auth'
import MenuBuilder from '~/server/utils/menuBuilder'

export const checkAccess = async (event: any): Promise<boolean> => {


    const { pathname } = getRequestURL(event)
    const pathToArr = pathname.split('/')
    const pathesToMatch = ['auth', 'register', '']

    if(!pathesToMatch.includes(pathToArr[1])) {
        const session: any = await getServerSession(event)    
        const user: IUser = await User.findOne({ uuid: session.uuid })
        if(user){
            const { pathes } = user.uuidCompany ? MenuBuilder.filteredAccess(user.acesses) : MenuBuilder.fullAccess()
console.log('------------------------------------------')
console.log('pathname: ', pathname)
console.log("pathes allowed: ", pathes)
console.log("'/' + pathToArr[1]: ", '/' + pathToArr[2])
console.log("includes: ", !pathes.includes('/' + pathToArr[2]) )
            if(!pathes.includes('/' + pathToArr[2])) {
console.log('return false')
            }
        }
    }
console.log('------------------------------------------')
    return true
}
