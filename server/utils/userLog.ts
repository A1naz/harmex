import { getServerSession } from '#auth'
import { ObjectId } from 'mongodb'
import { UserLogs } from '../lib/models/UserLogs'
import { UserOperation } from '~/data/types'
import { DocuemntEnum } from '~/data/enums'

const operationDescriptions: {[key in DocuemntEnum]: string} = {
   autoanswer: 'Автоответ',
   buyout: 'Выкуп' ,
   cart: 'Корзина',
   delivery: 'Доставка',
   like: 'Лайк',
   productsLike: 'Лайк на продукт',
   question: 'Вопрос',
   review: 'Отзыв',
}

const OperationActions = new Map<string, string>([
    [ 'PUT', 'Созданан документ' ],
    [ 'POST', 'Изменен документ' ],
    [ 'DELETE', 'Удален документ' ],
 ])

export const userLog = async (event: any, operation: UserOperation): Promise<void> => {

    try{
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        let description = OperationActions.get(event.method) + ' - ' +  operationDescriptions[operation.documentType] 
        if (operation.comment) description += ` (${operation.comment})`
        const userLog = new UserLogs({
            user: new ObjectId(session._id),
            description: description,
            documentType: operation.documentType,
            documentId: operation.documentId,
        })
        await userLog.save()
    }    
    catch(e:any){
        logger(event, 'ошибка записи действия пользователя')
    }
}
