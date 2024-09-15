import { getServerSession } from '#auth'
import request from 'request'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
const elPerPage = 50

export default eventHandler(async (event) => {
  const session = (await getServerSession(event)) as any
  if (!session) return sendRedirect(event, '/auth', 302)

  const { article, limit, page } = getQuery(event)
  if (!article) {
    return send(event, {
      status: 400,
      body: 'Article is required',
    })
  }

  const productUrl = `http://api.ozon.ru/composer-api.bx/page/json/v2?url=%2Fproduct%2F${article}%2F%3Flayout_container%3Dreviewshelfpaginator%26layout_page_index%3D4%26page%3D2%26reviewsFilters%3De30K%26reviewsVariantMode%3D2%26sh%3Db93L0h4A6Q%26sort%3Dpublished_at_desc%26start_page_id%3D1dd1ae16494e63a9b04a45ab8ce917d5%26tab%3Dreviews`
  const options = {
    url: productUrl,
    proxy: 'http://' + proxy,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
    },
  }

  const data: any = await new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {
      if (!error) {
        resolve(JSON.parse(body))
      } else {
        console.log(error)

        reject(new Error(`Непредвиденный статус код`))
      }
    })
  })

  const widgetStates: any = data['widgetStates']
  const productData: any = JSON.parse(
    widgetStates['webListReviews-3201466-reviewshelfpaginator-4']
  )
  const reviews = productData['reviews']

  let feedbacks = reviews.map((feedback: any, index: number) => {
    return {
      id: feedback.uuid,
      rating: feedback.content.score || 0,
      text: feedback.content.comment || '',
      user: {
        name: feedback.author.firstName || 'Покупатель OZON',
        country: 'Россия',
      },
      likes: feedback.usefulness ? feedback.usefulness.useful || 0 : 0,
      dislikes: feedback.usefulness ? feedback.usefulness.unuseful || 0 : 0,
      rank: index,
    }
  })

  // let feedbacks = limited.map((feedback: any, index: number) => {
  //   const likes = feedback?.feedbackHelpfulness?.filter(
  //     (help: any) => help.helpfulness === 'plus'
  //   ).length
  //   const dislikes = feedback?.feedbackHelpfulness?.filter(
  //     (help: any) => help.helpfulness === 'minus'
  //   ).length
  //   return {
  //     id: 'feedback.id',
  //     rating: feedback.productValuation,
  //     text: feedback.text,
  //     date: feedback.createdDate,
  //     user: {
  //       name: 'Покупатель Wildberries',
  //       country: 'Россия',
  //     },
  //     likes: likes || 0,
  //     dislikes: dislikes || 0,
  //     rank: index,
  //   }
  // })

  return { feedbacks, feedbacksCount: feedbacks.length }
})
