import { getServerSession } from '#auth'
import request from 'request'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
import fs from 'node:fs'
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
    proxy: 'http://' + '12241368-all-country-RU:1fpqto385f@62.112.9.140:13791',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
      Cookie:
        'abt_data=6f1c85a362247a2e2baab08434cbd5f4:ea1c17b7a1c39e7c3fc65517db21ecba19933b127fb373693cc3fe5d86e672417a4173b1d25d60ae9e47bcedebf193d4742b7016017d24f05ee3c8c525c14c9e29f4375cf019733e13884eec64db88f8552f95c451c7423b354736addc5f1039ce3ab065f3d83e1b0711ee5ae53898b40dcf5471f63661c4e7442d97ec0c110086669b3e43d71f236a05e4e65f3f87cbb434f9d070ebc88d0a90c1b4aa8fad30b711062243a137d7ca6dc14a2277d331dae0c285919bdcdb1a0b0cc6e4b06876d42f02eb3fdb3dbf6df71293f996b728ff9d8da82bbed7d03aede449fe5ec022b6a9e3113b904741e2c934cf817f74aa5cf6af539317614471101c60d99f211a32b232faf0712e97ee27579a56421d853e95bb0298d6cf662b37db79776d0887e820bcfc7f6f19cb8d9c51000ed0f93dbe7cad2d1d75c0dde92c6f971618710d0cf23762b6ee790dab8e31cf173b8ccd8d8647f8bd95b2bc53caf91f38da80217cd8b9286ec19dfbdf9e12794a1a62b93a5b2cb75336d6029a280617ec243a99058ee0d68f7028e5f0065240b5da45cc',
    },
  }

  const data: any = await new Promise((resolve, reject) => {
    request.get(options, function (error, response, body) {
      if (!error) {
        resolve( JSON.parse(body)) // Разрешение обещания с данными, если запрос успешен
      } else {
        console.log(error)

        reject(new Error(`Непредвиденный статус код`)) // Обработка непредвиденных статусов ответа
      }
    })
  })

const widgetStates: any = data['widgetStates']
const productData: any = JSON.parse(widgetStates['webListReviews-3201466-reviewshelfpaginator-4'])
const reviews = productData['reviews']

let feedbacks = reviews.map((feedback: any, index: number) => {
console.log(feedback);

  return {
    id: feedback.uuid,
    rating: feedback.content.score,
    text: feedback.content.comment,
    user: {
      name: feedback.author.firstName || 'Покупатель OZON',
      country: 'Россия',
    },
    likes: feedback.usefulness.useful || 0,
    dislikes: feedback.usefulness.unuseful || 0,
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
