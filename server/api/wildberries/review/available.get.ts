import { Delivery } from '@/server/lib/models/wildberries/Delivery'
import { Buyout } from '~~/server/lib/models/wildberries/Buyout'
import { ObjectId } from 'mongodb'
import { SelectOptionsReviews } from '@/data/enums'

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event)
  if (!user) return sendRedirect(event, '/auth', 302)

  const { skip, limit, search } = getQuery(event)

  const limitA = limit ? parseInt(limit.toString(), 10) : 100
  const skipA = skip ? parseInt(skip.toString(), 10) : 0
  const searchParse = search ? JSON.parse(search?.toString()) : undefined


  const deliveriesForReview = await Delivery.find({
    user,
    reviewed: { $ne: true },
    status: 'completed',
    'statusdelivery.status': { $regex: 'Получен' },
  })
  .sort({ _id: -1 })
  .skip(skipA as number)
  .limit(limitA as number);
  
  const buyoutsId = deliveriesForReview.map((item) => item.idbuyout);
  
  const buyouts = await Buyout.find({ _id: { $in: buyoutsId } });

  const format: any = [];
  
  await Promise.all(
    deliveriesForReview.map(async (delivery) => {
      const buyout = buyouts.find((item) => item._id.valueOf() === delivery.idbuyout.valueOf());
      
      if (buyout) {
        const existingArticle = format.find((item: any) => item.article === delivery.article);
  
        const formattedDelivery = {
          delivId: delivery._id,
          pricebuy: buyout.product.price,
          updatedAt: delivery.updatedAt,
          buyoutId: delivery.idbuyout,
          gender: buyout.gender,
          sizeparam: buyout.sizeparam,
          sex: buyout.gender,
        };
  
        if (existingArticle) {
          existingArticle.delivs.push(formattedDelivery);
          existingArticle.countAvailable += 1; 
        } else {
          format.push({
            article: delivery.article,
            lastUpdated: delivery.updatedAt,
            countAvailable: 1,
            productimage: [buyout.product.image],
            productname: [buyout.product.name],
            delivs: [formattedDelivery],
            countSoon: 0,
          });
        }
      }
    })
  );

  console.log(format.length === limitA, format.length,limitA);
  return {
    data: format.sort((a, b) => b.countAvailable - a.countAvailable),
    continueLoading: deliveriesForReview.length === limitA 
  };
})
