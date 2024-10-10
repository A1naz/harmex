import { User } from "~~/server/lib/models/User";

export default defineEventHandler(async (event) => {
    const isAuth = await getUserSession(event);

    if (!isAuth) {
        return sendRedirect(event, '/auth', 302);
    }

    const { accesses, quickAccesses } = await readBody(event);

    const user = await User.findOne({ uuid: isAuth.user?.uuid }).select('uuid accesses quickAccesses');

    if (!user) {
        return sendRedirect(event, '/auth', 302);
    }

    await User.updateOne(
        { uuid: isAuth.user?.uuid },
        { $set: {quickAccesses } }
    );

    return { accesses, quickAccesses };
});
