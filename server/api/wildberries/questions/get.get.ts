import { Question } from '~~/server/lib/models/wildberries/Question'

export default eventHandler(async (event) => {

    const user = await getAdminEntity(event)
    if (!user) return sendRedirect(event, '/auth', 302)

    const { dateFilter,string, type } = getQuery(event)
  const questions = await Question.find({ user }).sort({ _id: -1 })

  let filter = questions

  if (type === 'article') {
    filter = await Question.find({
      user,
      $or: [
        { article: { $regex: string, $options: 'i' } },
      ],
    })
  }
  else {
    filter = await Question.find({ user })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(50)
  }

  const today = new Date(Date.now())
  today.setHours(0, 0, 0, 0)
  switch (dateFilter) {
    case 'completed':
      filter = await Question.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'created':
      filter = await Question.find({
        user,
        $or: [
          { status: { $regex: dateFilter, $options: 'i' } },
        ],
      })
      break
    case 'today':
      filter = questions.filter(item => new Date(item.createdDate) > today)
      break
    case '3days':
      filter = questions.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
      break
    case '7days':
      filter = questions.filter(item => new Date(item.createdDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
      break
  }

  

  const format = (filter ? filter : questions).map((question, index) => {
    return {
      place: index + 1,
      status: question.status,
      article: question.article,
      image: question.image,
      gender: question.gender,
      createdDate: question.createdDate,
      text: question.text,
      publishDate: question.publishDate,
    }
  })
  return format
})
