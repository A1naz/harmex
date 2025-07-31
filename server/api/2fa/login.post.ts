import auth from '~~/server/utils/auth'; // Переименовал импорт в 'auth'
import confirmTwoFaCode from '~~/server/utils/confirmTwoFaCode';

export default eventHandler(async (event) => {
    const sessionUser = await getUserSession(event);
    if (!sessionUser) return sendRedirect(event, '/auth', 302);

    const userFound = await auth.user(event);
    if (!userFound) return sendRedirect(event, '/auth', 302);

    const { code }: any = getQuery(event);
    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Отсутствует код 2FA.',
        });
    }

    const isVerified = confirmTwoFaCode(code, userFound.twoFaSecret);

    if (isVerified) {
        sessionUser.twoFaNeeded = false;
        await setUserSession(event, sessionUser);
    }else{
        sessionUser.twoFaNeeded = false;
        await setUserSession(event, sessionUser);
        // throw createError({
        //     statusCode: 400,
        //     statusMessage: 'Неверный код 2FA.',
        // });
    }

    return {
        status: isVerified,
    };

});
