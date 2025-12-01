import { Review } from "~~/server/lib/models/goldApple/Review";
import { Delivery } from "~/server/lib/models/goldApple/Delivery";
import { Buyout } from "~/server/lib/models/goldApple/Buyout";
import { ObjectId } from "mongodb";
import { SelectOptionsReviews } from "@/data/enums";
import { paymenthistory } from "~/server/lib/models/Paymenthistory";
import { create } from "node:domain";

function getReviewType(review: any) {
  if (review.images[0] !== "" && review.isVideoEnabled) {
    return "Комбинированный";
  }
  if (review.images[0] !== "") {
    return "Фото отзыв";
  }
  if (review.isVideoEnabled) {
    return "Видео отзыв";
  }
  if (review.text !== "") {
    return "Текстовый отзыв";
  }
  return "Отзыв";
}

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { skip, limit, tab, search, dateFilter } = getQuery(event);

  let dateQuery = {};

  switch (dateFilter) {
    case "today":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
    case "2days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(0, 0, 0),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
    case "3days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(0, 0, 0),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
    case "7days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 6)).setHours(0, 0, 0),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
  }

  let searchParse = search ? JSON.parse(search?.toString()) : {};

  if (Object.values(searchParse)[0] !== "") {
    // eslint-disable-next-line eqeqeq
    if (Object.keys(searchParse)[0] == SelectOptionsReviews.idReview) {
      searchParse = {
        _id: new ObjectId(searchParse[SelectOptionsReviews.idReview]),
      };
    }
  }

  let reviews: any = [];
  let query: any = { user: user._id };

  if (Object.keys(searchParse)[0] === SelectOptionsReviews.uuidBuyout) {
    const foundDelivery = await Delivery.findOne({
      uuidbuyout: searchParse[SelectOptionsReviews.uuidBuyout],
    });
 
    if (foundDelivery) {
      query = Object.assign(query, { delivery: foundDelivery._id });
    }
  } else if (Object.keys(searchParse)[0] === "article" && searchParse.article) {
    // Обрабатываем поиск по артикулу - ищем и как строку, и как число
    const searchArticle = searchParse.article.toString().trim();
    const numericArticle = Number.parseInt(searchArticle, 10);
    
    // Находим все delivery с таким артикулом
    const foundDeliveries = await Delivery.find({
      user: user._id,
      $or: [{ article: searchArticle }, { article: numericArticle }],
    }).select("_id");
    
    if (foundDeliveries.length > 0) {
      query = Object.assign(query, { 
        delivery: { $in: foundDeliveries.map(d => d._id) } 
      });
    } else {
      // Если не нашли доставки, делаем так чтобы ничего не нашлось
      query = Object.assign(query, { _id: new ObjectId("000000000000000000000000") });
    }
  } else if (Object.keys(searchParse)[0] && Object.values(searchParse)[0] !== "") {
    query = Object.assign(query, searchParse);
  }

  if (tab === "all") {
    // Используем агрегацию для приоритетной сортировки
    reviews = await Review.aggregate([
      {
        $match: { ...query, ...dateQuery }
      },
      {
        $addFields: {
          sortPriority: {
            $switch: {
              branches: [
                { case: { $in: ["$status", ["waiting", "working"]] }, then: 1 }, // Активные
                { case: { $in: ["$status", ["archived", "nofunds"]] }, then: 2 }, // Архив/нет средств
              ],
              default: 3 // Все остальные
            }
          }
        }
      },
      {
        $sort: { sortPriority: 1, _id: -1 }
      },
      {
        $skip: Number(skip) || 0
      },
      {
        $limit: Number(limit) || 50
      }
    ]);
  } else if (tab === "work") {
    query = Object.assign(query, {
      status: { $in: ["created", "working", "waiting", "work"] },
    });
    reviews = await Review.find({...query, ...dateQuery})
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  } else if (tab) {
    query = Object.assign(query, { status: tab.toString() });
    reviews = await Review.find({...query, ...dateQuery})
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  }

  const deliveries = await Delivery.find({
    _id: { $in: reviews.map((rev: any) => rev.delivery) },
  });

  const buyoutsPublished = await Buyout.find({
    _id: { $in: deliveries.map((del: any) => del.idbuyout) },
  });

  
    const paymenthistories = await paymenthistory.find({
      type: "review",
      basisoperation: { $in: reviews.map((rev: any) => "" + rev._id) },
    });

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
        date: review.publishDate ? review.publishDate : review.date,
        status: review.status,
        uuid: review.uuid,
        type: getReviewType(review),
        originalVideoName: review.originalVideoName,
        additionText: review.additionText,
        disputed: review.disputed,
      };

      // eslint-disable-next-line eqeqeq
      const delivery = deliveries.find(
        (delivery: any) => delivery._id.valueOf() == review.delivery.valueOf()
      );
      if (delivery) {
        format.buyoutuuid = delivery.uuidbuyout;

        const buyout = buyoutsPublished.find(
          (buyout: any) => buyout._id.valueOf() == delivery.idbuyout.valueOf()
        );
        format.recipient = delivery.recipient;
        
        if (buyout) {
          format.product = buyout.product;
          format.gender = buyout.gender == "male" ? "Мужской" : "Женский";
        }
      }
      const history = paymenthistories.find(
        (history: any) => history.basisoperation === "" + review._id
      );
      if (history) {
        format.completedDate = history.dataoperation;
        format.financePrice = history.summ;
      }

      return format;
    })
  );



  
  // =================================
  const pipeLine: any[] = [
    {
      $match: {
        user: user._id,
        reviewed: { $ne: true },
        'statusdelivery.status': {
          $regex: '^(выполнен|Выполнен)$',
        },
        status: 'completed',
      },
    },
    { $sort: { _id: -1 } },
    {
      $project: {
        _id: 1,
        article: 1,
        updatedAt: 1,
        pricebuy: 1,
        idbuyout: 1,
        uuidbuyout: 1,
        recipient: 1,
        data8: 1, // gender
      },
    },
    {
      $lookup: {
        from: 'buyouts',
        localField: 'idbuyout',
        foreignField: '_id',
        as: 'buyout',
      },
    },
    {
      $unwind: {
        path: '$buyout',
      },
    },
    {
      $addFields: {
        size: '$buyout.sizeparam',
        productname: '$buyout.product.name',
        productimage: '$buyout.product.image',
        gender: ['$data8', '$buyout.gender'],
        sizeparam: '$buyout.sizeparam',
        url: '$buyout.url',
      },
    },
    {
      $group: {
        _id: '$uuidbuyout',
        article: { $last: '$article' },
        lastUpdated: { $last: '$updatedAt' },
        countAvailable: { $sum: 1 },
        productimage: { $addToSet: '$productimage' },
        productname: { $addToSet: '$productname' },
        url: { $addToSet: '$url' },
        delivs: {
          $push: {
            delivId: '$_id',
            pricebuy: '$pricebuy',
            updatedAt: '$updatedAt',
            buyoutId: '$uuidbuyout',
            gender: '$gender',
            sizeparam: '$sizeparam',
            recipient: '$recipient',
          },
        },
      },
    },
    { $project: { _id: 0 } },
    { $sort: { countAvailable: -1 } },
  ]

  const limitA = limit ? parseInt(limit.toString(), 10) : 1000
  const skipA = skip ? parseInt(skip.toString(), 10) : 0
  let searchParse = search ? JSON.parse(search?.toString()) : undefined

  if (Object.values(searchParse)[0] !== '') {
    if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
      searchParse = { uuidbuyout: searchParse.uudidBuyout.replace('#', '') };
      pipeLine.splice(3, 0, { $match: { ...searchParse } }) // after $project
    } else {
      if (Object.keys(searchParse)[0] === 'article') {
        searchParse.article = Number(searchParse.article);
      }
      pipeLine.splice(1, 0, { $match: { ...searchParse } }) // after $match
    }
  }

  // if (skipA > 0) pipeLine.push({ $skip: skipA })
  // if (limitA > 0) pipeLine.push({ $limit: limitA })


  const readyForReview = await Delivery.aggregate(pipeLine)
  if (!readyForReview) return []

  const soonForReview = await Delivery.aggregate([
    {
      $match: {
        user: new ObjectId(user._id),
        status: 'active',
        reviewed: false,
      },
    },
    {
      $group: {
        _id: '$article',
        count: { $sum: 1 },
      },
    },
  ])

  const genderMap = new Map<string, string>([
    ['female', 'Женский'],
    ['male', 'Мужской'],
  ])
  const sex = (gender: string): string => {
    if (gender && gender.length > 0) {
      return gender.split(" ")[0];
    }
    return "Нет";
  };
  const formated = readyForReview.map((deliveryForReview: any) => {
    const countSoon = soonForReview.filter((sfr) => sfr._id == deliveryForReview.article)
    return {
      ...deliveryForReview,
      countSoon: countSoon.length > 0 ? countSoon[0].count : 0,
      delivs: deliveryForReview.delivs.map((delivery: any) => {
        return {
          ...delivery,
          sex: sex(delivery.recipient),
        }
      }),
    }
  })

  return {
    reviews: format,
    availableReviews: formated,
  };
});

// refactor all this

