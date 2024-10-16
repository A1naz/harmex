import { Delivery } from '@/server/lib/models/ozon/Delivery'
import { ObjectId } from 'mongodb'
import { SelectOptionsReviews } from '@/data/enums'
import { Buyout } from '~/server/lib/models/ozon/Buyout';

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

  // if (searchParse && Object.values(searchParse)[0] !== '') {
  //   if (Object.keys(searchParse)[0] === SelectOptionsReviews.uuidBuyout) {
  //     filter.uuidbuyout = searchParse.uudidBuyout.replace('#', '');
  //   } else {
  //     Object.assign(filter, searchParse);
  //   }
  // }

  if (searchParse && Object.values(searchParse)[0] !== '') {
    if (Object.keys(searchParse)[0] === SelectOptionsReviews.uuidBuyout) {
      filter.uuidbuyout = searchParse.uudidBuyout.replace('#', '');
    } else if (Object.keys(searchParse)[0] === 'article') {
      const searchArticle = searchParse.article.trim().toLowerCase();
      const numericArticle = parseInt(searchArticle, 10);

      filter.$or = [
        { article: searchArticle },  
        { article: numericArticle }, 
      ];
    } else {
      Object.assign(filter, searchParse);
    }
  }
    // console.log('available ozon filter', filter);


  const deliveries = await Delivery.find(filter)
    .select('_id article updatedAt pricebuy idbuyout uuidbuyout data8') 
    .sort({ _id: -1 })
    .lean();

  const buyoutIds = deliveries.map(delivery => delivery.idbuyout);

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

    if (productImage !== '/no-image.png') {
      acc[article].productimage.add(productImage);
    }
    if (productName !== 'Неизвестно') {
      acc[article].productname.add(productName);
    }

    acc[article].delivs.push({
      delivId: delivery._id,
      pricebuy: delivery.pricebuy,
      updatedAt: delivery.updatedAt,
      buyoutId: delivery.uuidbuyout,
      gender: [delivery.data8, buyout?.gender],
      sizeparam: buyout?.sizeparam || '0',
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
