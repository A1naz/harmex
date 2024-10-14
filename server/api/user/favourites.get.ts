import { User } from "~~/server/lib/models/User"

export default defineEventHandler(async (event) => {
    const isAuth = await getUserSession(event)

    if (!isAuth) {
        return []
    }

    const user = await User.findOne({ uuid: isAuth.user?.uuid }).select('uuid favourites services')

    if (!user) {
        return []
    }

    return {favourites:user.favourites, services: user.services};

})
