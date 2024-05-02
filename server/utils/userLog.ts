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
   like: 'Лайк на отзывы',
   partners: 'Партнерка',
   payment: 'Пополнение счета',
   paymentHistory: 'Финансы',
   productsLike: 'Лайк на товар/бренд',
   questionLikes: 'Лайк на вопрос',
   question: 'Вопрос',
   review: 'Отзыв',
   user: 'Пользователь',
}

const OperationActions = new Map<string, string>([
    [ 'GET', 'Создан документ' ],
    [ 'POST', 'Создан документ' ],
    [ 'PUT', 'Изменен документ' ],
    [ 'DELETE', 'Удален документ' ],
 ])

const marketplace = [
    'wildberries',
    'ozon',
    'avito',
]

export const userLog = async (event: any, operation: UserOperation): Promise<void> => {
    try{
        const mp = marketplace.includes(getRequestURL(event).pathname.split('/')[2]) ? getRequestURL(event).pathname.split('/')[2] : ''
        const session = (await getServerSession(event)) as any
        const user = await User.findOne({ uuid: session.uuid })
        let description = OperationActions.get(event.method) + ' - ' +  operationDescriptions[operation.documentType] 
        if (operation.comment) description += ` (${operation.comment})`

        if (user) {
            // console.log(event.method, OperationActions.get(event.method))
            const userLog = new UserLogs<IUserLogs>({
                userId: user._id,
                userNick: user?.username ?? "",
                userEmail: user?.email ?? "",
                uuidCompany: user?.roles.includes(UserRoles.staff) ? user?.uuidCompany : user.uuid,
                description: description,
                documentType: operation.documentType,
                documentId: operation.documentId,
                mp: mp,
            })
            // console.log(userLog)
            await userLog.save()
        }

    }    
    catch(e:any){
        logger(event, 'ошибка записи действия пользователя')
    }
}
