import { getServerSession } from '#auth'
import { ObjectId } from 'mongodb'
import { UserLogs } from '../lib/models/UserLogs'
import { UserOperation } from '~/data/types'

const OperationDescriptions = new Map<string, string>([
   [ 'autoanswer', 'Автоответ' ],
   [ 'buyout', 'Выкуп' ],
])
const OperationActions = new Map<string, string>([
    [ 'PUT', 'Создание' ],
    [ 'POST', 'Изменение' ],
    [ 'DELETE', 'Удаление' ],
 ])

export const userLog = async (event: any, operation: UserOperation): Promise<void> => {

    try{
        const session = (await getServerSession(event)) as any
        if (!session) return sendRedirect(event, '/auth', 302)
        
        const userLog = new UserLogs({
            user: new ObjectId(session._id),
            description: OperationDescriptions.get(operation.operationType) + ' - ' + OperationActions.get(event.method),
            operationType: operation.operationType,
            operationId: operation.operationId,
        })
        await userLog.save()
    }    
    catch(e:any){
        return sendRedirect(event, '/auth', 302)
    }
}
