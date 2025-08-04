export default function getHistoryType(type: string) {
    let result = ''
    switch (type) {
      case 'buyouts':
        result = 'Выкуп'
        break
      case 'buyouts service':
        result = 'Оплата выкупа'
        break
      case 'review':
        result = 'Отзыв'
        break
      case 'likeReview':
        result = 'Лайк на отзыв'
        break
      case 'likeProduct':
        result = 'Лайк на товар / бренд'
        break
      case 'cart':
        result = 'Добавление в корзину'
        break
      case 'questionProduct':
        result = 'Вопрос'
        break
      case 'deliveryStorage':
        result = 'Штраф'
        break
      case 'reviewRemoving':
        result = 'Удаление отзыва'
        break
      case 'viewing':
        result = 'Просмотр'
        case 'generateRewievs':
          result = 'AI'
        case 'commission':
          result = 'Комиссия портала'
    }
    return result
  }