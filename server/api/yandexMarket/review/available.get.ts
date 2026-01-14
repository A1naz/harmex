import { SelectOptionsReviews } from '@/data/enums'
import { Delivery } from '@/server/lib/models/yandexMarket/Delivery'
import { ObjectId } from 'mongodb'
import { Buyout } from '~/server/lib/models/yandexMarket/Buyout'

export default eventHandler(async (event) => {
  const user: any = await getAdminEntity(event)
  if (!user)
    return sendRedirect(event, '/auth', 302)

  // eslint-disable-next-line unused-imports/no-unused-vars
  const { skip, limit, search } = getQuery(event)
  const searchParseAvailable = search
  ? JSON.parse(search?.toString())
  : undefined;

  const filter: any = {
    'user': new ObjectId(user._id),
    'reviewed': { $ne: true },
    $or: [
      { 'statusdelivery.status': 'Уже у вас' }, // с обычными пробелами
      { 'statusdelivery.status': 'Уже у вас' } // с неразрывным пробелом (char 160)
    ],
    'status': 'completed',
  }

if (searchParseAvailable && Object.values(searchParseAvailable)[0] !== "") {
  if (
    Object.keys(searchParseAvailable)[0] === SelectOptionsReviews.uuidBuyout
  ) {
    filter.uuidbuyout = searchParseAvailable.uudidBuyout.replace("#", "");
  } else if (Object.keys(searchParseAvailable)[0] === "article") {
    const searchArticle = searchParseAvailable.article.trim().toLowerCase();
    const numericArticle = Number.parseInt(searchArticle, 10);

    filter.$or = [{ article: searchArticle }, { article: numericArticle }];
  } else {
    Object.assign(filter, searchParseAvailable);
  }
}
const deliveriesAvailable = await Delivery.find(filter)
  .select("_id article updatedAt pricebuy idbuyout uuidbuyout data8 recipient")
  .sort({ _id: -1 })
  .lean();

const buyoutIds = deliveriesAvailable.map((delivery) => delivery.idbuyout);

const buyouts = (await Buyout.find({ _id: { $in: buyoutIds } })
  .select("sizeparam product gender")
  .lean()) as any;

const buyoutMap = buyouts.reduce((acc: any, buyout: any) => {
  acc[buyout._id] = buyout;
  return acc;
}, {}) as any;

const groupedArticles = deliveriesAvailable.reduce(
  (acc: any, delivery: any) => {
    const article = delivery.article.toString().trim().toLowerCase();
    const buyout = buyoutMap[delivery.idbuyout];

    if (!acc[article]) {
      acc[article] = {
        article,
        lastUpdated: delivery.updatedAt,
        countAvailable: 0,
        productimage: new Set(),
        productname: new Set(),
        delivs: [],
      };
    }

    acc[article].countAvailable += 1;

    const productImage = buyout?.product?.image || "/no-image.png";
    const productName = buyout?.product?.name || "Неизвестно";

    acc[article].productimage.add(productImage);
    acc[article].productname.add(productName);

    acc[article].delivs.push({
      delivId: delivery._id,
      pricebuy: delivery.pricebuy,
      updatedAt: delivery.updatedAt,
      buyoutId: delivery.uuidbuyout,
      gender: delivery.recipient,
      sizeparam: buyout?.sizeparam,
    });

    return acc;
  },
  {}
);

const result = Object.values(groupedArticles)
  .map((article: any) => ({
    ...article,
    productimage: Array.from(article.productimage),
    productname: Array.from(article.productname),
  }))
  .sort((a, b) => b.countAvailable - a.countAvailable);

const genderMap = new Map<string, string>([
  ["female", "Женский"],
  ["male", "Мужской"],
]);

const sex = (gender: string): string => {
  if (gender && gender.length > 0) {
    return gender.split(" ")[0];
  }

  return "Нет";
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
  return {
    availableReviews: formated
  }
})
