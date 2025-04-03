import { BalanceWithdraw } from '~/server/lib/models/BalanceWithdraw'
import auth from '~~/server/utils/auth'

export default eventHandler(async (event) => {

        const user = await auth.user(event)
        if (!user)
                return sendRedirect(event, '/auth', 302)
        if (user.uuidCompany) throw createError({ statusCode: 403, message: 'Работникам запрещено создавать запрос на вывод' })
                
        const { amount, info, cardInfo, modalType } = await readBody(event)

        if (Number(amount) < 100) {
                return {
                        status: 'error',
                        message: 'Минимальная сумма вывода - 5000 руб.',
                }
        }
        const balance = user.balance

        if (!balance || Number(amount) > balance) {
                return {
                        status: 'error',
                        message: 'Сумма вывода не должна быть больше доступного баланса',
                }
        }


        const withdraw = await BalanceWithdraw.create({
                userUuid: user.uuid,
                user,
                amount: Number(amount),
                status: 'created',
                type: modalType,
                info: info,
                cardInfo: cardInfo,
                username: user.username,
                userPhoneNumber: user.phoneNumber,
                userEmail: user.email,
                date: new Date(),
        })

        return { status: 'ok', document: withdraw, message: 'success' }

})
