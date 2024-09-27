import { Delivery } from '@/server/lib/models/wildberries/Delivery'
import { ObjectId } from 'mongodb'
import { Buyout } from '~/server/lib/models/wildberries/Buyout';
import { SelectOptionsReviews } from '@/data/enums'

// export default eventHandler(async (event) => {
//   const user = await getAdminEntity(event)
//   if (!user) return sendRedirect(event, '/auth', 302)

//   const { skip, limit, search } = getQuery(event)

//   const pipeLine: any[] = [
//     {
//       $match: {
//         user: new ObjectId(user._id),
//         reviewed: { $ne: true },
//         'statusdelivery.status': {
//           $regex: 'Получен',
//         },
//         status: 'completed',
//       },
//     },
//     { $sort: { _id: -1 } },
//     {
//       $project: {
//         _id: 1,
//         article: 1,
//         updatedAt: 1,
//         pricebuy: 1,
//         idbuyout: 1,
//         uuidbuyout: 1,
//         data8: 1, // gender
//       },
//     },
//     {
//       $lookup: {
//         from: 'buyouts',
//         localField: 'idbuyout',
//         foreignField: '_id',
//         as: 'buyout',
//       },
//     },
//     {
//       $unwind: {
//         path: '$buyout',
//       },
//     },
//     {
//       $addFields: {
//         size: '$buyout.sizeparam',
//         productname: '$buyout.product.name',
//         productimage: '$buyout.product.image',
//         gender: ['$data8', '$buyout.gender'],
//         sizeparam: '$buyout.sizeparam',
//       },
//     },
//     {
//       $group: {
//         _id: '$article',
//         article: { $last: '$article' },
//         lastUpdated: { $last: '$updatedAt' },
//         countAvailable: { $sum: 1 },
//         productimage: { $addToSet: '$productimage' },
//         productname: { $addToSet: '$productname' },
//         delivs: {
//           $push: {
//             delivId: '$_id',
//             pricebuy: '$pricebuy',
//             updatedAt: '$updatedAt',
//             buyoutId: '$uuidbuyout',
//             gender: '$gender',
//             sizeparam: '$sizeparam',
//           },
//         },
//       },
//     },
//     { $project: { _id: 0 } },
//     { $sort: { countAvailable: -1 } },
//   ]

//   const limitA = limit ? parseInt(limit.toString(), 10) : 1000
//   const skipA = skip ? parseInt(skip.toString(), 10) : 0
//   let searchParse = search ? JSON.parse(search?.toString()) : undefined

//   if (searchParse.article) {
//     searchParse.article = {
//       $in: [searchParse.article, Number(searchParse.article)],
//     }
//   }

//   if (Object.values(searchParse)[0] !== '') {
//     if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
//       searchParse = { uuidbuyout: searchParse.uudidBuyout.replace('#', '') }
//       pipeLine.splice(3, 0, { $match: { ...searchParse } }) // after $project
//     } else {
//       pipeLine.splice(1, 0, { $match: { ...searchParse } }) // after $match
//     }
//   }

//   // if (skipA > 0) pipeLine.push({ $skip: skipA })
//   // if (limitA > 0) pipeLine.push({ $limit: limitA })

//   const readyForReview = await Delivery.aggregate(pipeLine)
//   if (!readyForReview) return []

//   const soonForReview = await Delivery.aggregate([
//     {
//       $match: {
//         user: new ObjectId(user._id),
//         status: 'active',
//         reviewed: false,
//       },
//     },
//     {
//       $group: {
//         _id: '$article',
//         count: { $sum: 1 },
//       },
//     },
//   ])

//   const genderMap = new Map<string, string>([
//     ['female', 'Женский'],
//     ['male', 'Мужской'],
//   ])
//   const sex = (genders: string[]): string => {
//     for (const gen of genders) {
//       if (gen) {
//         let foundGen = genderMap.get(gen.toLowerCase())
//         if (foundGen) return foundGen
//       }
//     }
//     return 'Нет'
//   }
//   const formated = readyForReview.map((deliveryForReview: any) => {
//     const countSoon = soonForReview.filter(
//       (sfr) => sfr._id == deliveryForReview.article
//     )

//     return {
//       ...deliveryForReview,
//       countSoon: countSoon.length > 0 ? countSoon[0].count : 0,
//       delivs: deliveryForReview.delivs.map((delivery: any) => {
//         return {
//           ...delivery,
//           sex: (delivery.gender = sex(delivery.gender)),
//         }
//       }),
//     }
//   })

//   return formated
// })

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, '/auth', 302);

  const { skip, limit, search } = getQuery(event);

  const skipA = skip ? parseInt(skip.toString(), 10) : 0;
  const limitA = limit ? parseInt(limit.toString(), 10) : 1000;
  let searchParse = search ? JSON.parse(search?.toString()) : undefined;

  const filter: any = {
    user: new ObjectId(user._id),
    reviewed: { $ne: true },
    'statusdelivery.status': { $regex: 'Получен' },
    status: 'completed'
  };

  if (searchParse && Object.values(searchParse)[0] !== '') {
    if (Object.keys(searchParse)[0] === SelectOptionsReviews.uuidBuyout) {
      filter.uuidbuyout = searchParse.uudidBuyout.replace('#', '');
    } else {
      Object.assign(filter, searchParse);
    }
  }

  const deliveries = await Delivery.find(filter)
    .select('_id article updatedAt pricebuy idbuyout uuidbuyout data8')
    .sort({ _id: -1 })
    // .skip(skipA)
    // .limit(limitA)
    .lean();

  const buyoutIds = deliveries.map(delivery => delivery.idbuyout);

  // user: new ObjectId(user._id),

  const buyouts = await Buyout.find({ _id: { $in: buyoutIds } })
    .select('sizeparam product gender')
    .lean() as any;

  const buyoutMap = buyouts.reduce((acc: any, buyout: any) => {
    acc[buyout._id] = buyout;
    return acc;
  }, {}) as any;

  const groupedArticles = deliveries.reduce((acc: any, delivery: any) => {
    const article = delivery.article.toString().trim().toLowerCase();
    const buyout = buyoutMap[delivery.idbuyout];

    if (!acc[article]) {
      acc[article] = {
        article,
        lastUpdated: delivery.updatedAt,
        countAvailable: 0,
        productimage: new Set(),
        productname: new Set(),
        delivs: []
      };
    }

    acc[article].countAvailable += 1;

    const productImage = buyout?.product?.image || '/no-image.png';
    const productName = buyout?.product?.name || 'Неизвестно';

    acc[article].productimage.add(productImage);
    acc[article].productname.add(productName);

    acc[article].delivs.push({
      delivId: delivery._id,
      pricebuy: delivery.pricebuy,
      updatedAt: delivery.updatedAt,
      buyoutId: delivery.uuidbuyout,
      gender: [delivery.data8, buyout?.gender],
      sizeparam: buyout?.sizeparam,
    });

    return acc;
  }, {});

  // const seenArticles = new Set();
  // Object.keys(groupedArticles).forEach((article) => {
  //   if (seenArticles.has(article)) {
  //     console.log(`Повторяющийся артикул: ${article}`);
  //   } else {
  //     seenArticles.add(article);
  //   }
  // });

  const result = Object.values(groupedArticles).map((article: any) => ({
    ...article,
    productimage: Array.from(article.productimage),
    productname: Array.from(article.productname)
  })).sort((a, b) => b.countAvailable - a.countAvailable);

  const genderMap = new Map<string, string>([
    ['female', 'Женский'],
    ['male', 'Мужской'],
  ]);

  const sex = (genders: string[]): string => {
    for (const gen of genders) {
      if (gen && typeof gen === 'string') {
        let foundGen = genderMap.get(gen.toLowerCase());
        if (foundGen) return foundGen;
      }
    }
    return 'Нет';
  };

  const formated = result.map((deliveryForReview: any) => {
    return {
      ...deliveryForReview,
      countSoon: 0,
      delivs: deliveryForReview.delivs.map((delivery: any) => {
        return {
          ...delivery,
          sex: sex(delivery.gender),
        };
      }),
    };
  });

  return formated;
});
