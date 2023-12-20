import { getServerSession } from '#auth'
import { UserLogs } from '../lib/models/UserLogs'
import { UserOperation, IUserLogs } from '~/data/types'
import { DocuemntEnum, UserRoles } from '~/data/enums'
import { User } from '../lib/models/User'

const operationDescriptions: {[key in DocuemntEnum]: string} = {
   autoanswer: 'Автоответ',
   buyout: 'Выкуп' ,
   cart: 'Корзина',
   delivery: 'Доставка',
   like: 'Лайк',
   partners: 'Партнеры',
   payment: 'Пополнение счета',
   paymentHistory: 'История платежей',
   productsLike: 'Лайк на продукт',
   question: 'Вопрос',
   review: 'Отзыв',
   user: 'Пользователь',
}

const OperationActions = new Map<string, string>([
    [ 'POST', 'Создан документ' ],
    [ 'PUT', 'Изменен документ' ],
    [ 'DELETE', 'Удален документ' ],
 ])

export const userLog = async (event: any, operation: UserOperation): Promise<void> => {

    try{
        const session = (await getServerSession(event)) as any
        const user = await User.findOne({ uuid: session.uuid })
        let description = OperationActions.get(event.method) + ' - ' +  operationDescriptions[operation.documentType] 
        if (operation.comment) description += ` (${operation.comment})`

        if (user) {
            const userLog = new UserLogs<IUserLogs>({
                userId: user._id,
                userNick: user?.username ?? "",
                userEmail: user?.email ?? "",
                uuidCompany: user?.roles.includes(UserRoles.staff) ? user?.uuidCompany : user.uuid,
                description: description,
                documentType: operation.documentType,
                documentId: operation.documentId,
            })
            await userLog.save()
        }

    }    
    catch(e:any){
        logger(event, 'ошибка записи действия пользователя')
    }
}
