import { UserLogs } from '@/server/lib/models/UserLogs'
import { DocuemntEnum, UserRoles } from '~/data/enums'
import type { IUserLogs, UserOperation } from '~/data/types'
import { User } from '../lib/models/User'

const operationDescriptions: { [key in DocuemntEnum]: string } = {
  autoanswer: 'Автоответ',
  buyout: 'Выкуп',
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
  [DocuemntEnum.Report]: '',
}

const OperationActions = new Map<string, string>([
  ['GET', 'Создан документ'],
  ['POST', 'Создан документ'],
  ['PUT', 'Изменен документ'],
  ['DELETE', 'Удален документ'],
])

const marketplace = [
  'wildberries',
  'ozon',
  'avito',
]

export async function userLog(event: any, operation: UserOperation): Promise<void> {
  try {
    const mp = marketplace.includes(getRequestURL(event).pathname.split('/')[2]) ? getRequestURL(event).pathname.split('/')[2] : ''
    const user = await getAdminEntity(event)
    if (!user)
      return sendRedirect(event, '/auth', 302)
    let description = `${OperationActions.get(event.method)} - ${operationDescriptions[operation.documentType]}`
    if (operation.comment)
      description += ` (${operation.comment})`

    if (user) {
      // console.log(event.method, OperationActions.get(event.method))
      const userLog = new UserLogs<IUserLogs>({
        userId: user._id,
        userNick: user?.username ?? '',
        userEmail: user?.email ?? '',
        uuidCompany: user?.roles.includes(UserRoles.staff) ? user?.uuidCompany : user.uuid,
        description,
        documentType: operation.documentType,
        documentId: operation.documentId,
        mp,
      })
      // console.log(userLog)
      await userLog.save()
    }
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (e: any) {
    logger(event, 'ошибка записи действия пользователя')
  }
}
