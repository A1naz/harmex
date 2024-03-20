import { getServerSession } from '#auth'
import request from 'request'
const config = useRuntimeConfig()
const proxy = config.CHANGING_PROXY
const elPerPage = 50
const apiKey = config.serverLoadApiKey

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

  const data: any = await $fetch('http://95.163.249.133:4141', {
    method: 'POST',
    parseResponse: JSON.parse,
    body: {
      type: 'ozonReviews',
      url: `https://www.ozon.ru/product/${article}/`,
      count: elPerPage,
    },
  })

  if (!data || data.status === 'error') {
    return {
      feedbacks: [],
      feedbacksCount: 0,
    }
  }

  data.forEach((feedback: any) => {
    feedback.comments.forEach((comment: any) => {
      comment.addLikes = 0
      comment.addDislikes = 0
    })
  })


  return {
    feedbacks: data,
    feedbacksCount: 0,
  }
})
