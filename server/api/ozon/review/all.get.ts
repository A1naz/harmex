import { SelectOptionsReviews } from '@/data/enums'
import { Review } from '~~/server/lib/models/ozon/Review'
import { ObjectId } from 'mongodb'
import { Delivery } from '~/server/lib/models/ozon/Delivery'
import { Buyout } from '~/server/lib/models/ozon/Buyout'

export default eventHandler(async (event) => {
        const user = await getAdminEntity(event)
        if (!user)
                return sendRedirect(event, '/auth', 302)

        const { skip, limit, tab, search } = getQuery(event)

        let searchParse = search ? JSON.parse(search?.toString()) : {}

        if (Object.values(searchParse)[0] !== '') {
                // eslint-disable-next-line eqeqeq
                if (Object.keys(searchParse)[0] == SelectOptionsReviews.idReview) {
                        searchParse = { _id: new ObjectId(searchParse[SelectOptionsReviews.idReview]) }
                }
        }

        let reviews: any = []
        let query: any = { user }

        if (Object.keys(searchParse)[0] !== SelectOptionsReviews.uuidBuyout) {
                query = Object.assign(query, searchParse)
        }

        if (tab === 'all') {
                reviews = await Review.find(query)
                        .sort({ _id: -1 })
                        .skip((skip as number) || 0)
                        .limit((limit as number) || 0)
        }
        else if (tab === 'work') {
                query = Object.assign(query, { status: { $in: ['created', 'working', 'waiting', 'work'] } })
                reviews = await Review.find(query)
                        .sort({ _id: -1 })
                        .skip((skip as number) || 0)
                        .limit((limit as number) || 0)
        }
        else if (tab) {
                query = Object.assign(query, { status: tab.toString() })
                reviews = await Review.find(query)
                        .sort({ _id: -1 })
                        .skip((skip as number) || 0)
                        .limit((limit as number) || 0)
        }

        const deliveries = await Delivery.find({ _id: { $in: reviews.map((rev: any) => rev.delivery) } })
        let format = await Promise.all(
                reviews.map(async (review: any) => {
                        const format: any = {
                                id: review._id,
                                article: review.article,
                                name: review.name,
                                text: review.text,
                                positive: review.positive,
                                negative: review.negative,
                                rating: review.rating,
                                images: review.images,
                                date: review.date,
                                status: review.status,
                                uuid: review.uuid,
                        }

                        // eslint-disable-next-line eqeqeq
                        const delivery = deliveries.find((delivery: any) => delivery._id.valueOf() == review.delivery.valueOf())
                        if (delivery) {
                                format.buyoutuuid = delivery.uuidbuyout
                        }

                        return format
                }),
        )

        // eslint-disable-next-line eqeqeq
        if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
                // eslint-disable-next-line eqeqeq
                format = format.filter(rev => rev.buyoutuuid == searchParse[SelectOptionsReviews.uuidBuyout])
        }



        // =================================



        const searchParseAvailable = search ? JSON.parse(search?.toString()) : undefined
        
          const filter: any = {
            'user': new ObjectId(user._id),
            'reviewed': { $ne: true },
            'statusdelivery.status': { $regex: 'Получен' },
            'status': 'completed',
          }
        
          if (searchParseAvailable && Object.values(searchParseAvailable)[0] !== '') {
            if (Object.keys(searchParseAvailable)[0] === SelectOptionsReviews.uuidBuyout) {
              filter.uuidbuyout = searchParseAvailable.uudidBuyout.replace('#', '')
            }
            else if (Object.keys(searchParseAvailable)[0] === 'article') {
              const searchArticle = searchParseAvailable.article.trim().toLowerCase()
              const numericArticle = Number.parseInt(searchArticle, 10)
        
              filter.$or = [
                { article: searchArticle },
                { article: numericArticle },
              ]
            }
            else {
              Object.assign(filter, searchParseAvailable)
            }
          }
        
          const deliveriesAvailable = await Delivery.find(filter)
            .select('_id article updatedAt pricebuy idbuyout uuidbuyout data8')
            .sort({ _id: -1 })
            .lean()
        
          const buyoutIds = deliveriesAvailable.map(delivery => delivery.idbuyout)
        
          const buyouts = await Buyout.find({ _id: { $in: buyoutIds } })
            .select('sizeparam product gender')
            .lean() as any
        
          const buyoutMap = buyouts.reduce((acc: any, buyout: any) => {
            acc[buyout._id] = buyout
            return acc
          }, {}) as any
        
          const groupedArticles = deliveriesAvailable.reduce((acc: any, delivery: any) => {
            const article = delivery.article.toString().trim().toLowerCase()
            const buyout = buyoutMap[delivery.idbuyout]
        
            if (!acc[article]) {
              acc[article] = {
                article,
                lastUpdated: delivery.updatedAt,
                countAvailable: 0,
                productimage: new Set(),
                productname: new Set(),
                delivs: [],
              }
            }
        
            acc[article].countAvailable += 1
        
            const productImage = buyout?.product?.image || '/no-image.png'
            const productName = buyout?.product?.name || 'Неизвестно'
        
            if (productImage !== '/no-image.png') {
              acc[article].productimage.add(productImage)
            }
            if (productName !== 'Неизвестно') {
              acc[article].productname.add(productName)
            }
        
            acc[article].delivs.push({
              delivId: delivery._id,
              pricebuy: delivery.pricebuy,
              updatedAt: delivery.updatedAt,
              buyoutId: delivery.uuidbuyout,
              gender: [delivery.data8, buyout?.gender],
              sizeparam: buyout?.sizeparam || '0',
            })
        
            return acc
          }, {})
        
          const result = Object.values(groupedArticles).map((article: any) => ({
            ...article,
            productimage: Array.from(article.productimage),
            productname: Array.from(article.productname),
          })).sort((a, b) => b.countAvailable - a.countAvailable)
        
          const genderMap = new Map<string, string>([
            ['female', 'Женский'],
            ['male', 'Мужской'],
          ])
        
          const sex = (genders: string[]): string => {
            for (const gen of genders) {
              if (gen && typeof gen === 'string') {
                const foundGen = genderMap.get(gen.toLowerCase())
                if (foundGen)
                  return foundGen
              }
            }
            return 'Нет'
          }
        
          const formated = result.map((deliveryForReview: any) => {
            return {
              ...deliveryForReview,
              countSoon: 0,
              delivs: deliveryForReview.delivs.map((delivery: any) => {
                return {
                  ...delivery,
                  sex: sex(delivery.gender),
                }
              }),
            }
          })

        return {
                reviews: format,
                availableReviews: formated
        }
})

// refactor all this
