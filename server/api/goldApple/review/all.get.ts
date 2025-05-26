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

  const pipeLine: any[] = [
    {
      $match: {
        user: user._id,
        reviewed: { $ne: true },
        "statusdelivery.status": {
          $regex: "^(Получен|Доставлен|Получено)$",
        },
        status: "completed",
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
        from: "buyouts",
        localField: "idbuyout",
        foreignField: "_id",
        as: "buyout",
      },
    },
    {
      $unwind: {
        path: "$buyout",
      },
    },
    {
      $addFields: {
        size: "$buyout.sizeparam",
        productname: "$buyout.product.name",
        productimage: "$buyout.product.image",
        gender: ["$data8", "$buyout.gender"],
        sizeparam: "$buyout.sizeparam",
      },
    },
    {
      $group: {
        _id: "$uuidbuyout",
        article: { $last: "$article" },
        lastUpdated: { $last: "$updatedAt" },
        countAvailable: { $sum: 1 },
        productimage: { $addToSet: "$productimage" },
        productname: { $addToSet: "$productname" },
        delivs: {
          $push: {
            delivId: "$_id",
            pricebuy: "$pricebuy",
            updatedAt: "$updatedAt",
            buyoutId: "$uuidbuyout",
            gender: "$gender",
            sizeparam: "$sizeparam",
            recipient: "$recipient",
          },
        },
      },
    },
    { $project: { _id: 0 } },
    { $sort: { countAvailable: -1 } },
  ];

  const { skip, limit, search, dateFilter } = getQuery(event);

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
    if (Object.keys(searchParse)[0] == SelectOptionsReviews.idReview) {
      searchParse = {
        _id: new ObjectId(searchParse[SelectOptionsReviews.idReview]),
      };
    }
  }

  let reviews: any = [];
  let query: any = { user };

  if (Object.keys(searchParse)[0] !== SelectOptionsReviews.uuidBuyout) {
    query = Object.assign(query, searchParse);
  }
  reviews = await Review.find({ ...query, ...dateQuery })
    .sort({ _id: -1 })
    .skip((skip as number) || 0)
    .limit((limit as number) || 0);

  const deliveries = await Delivery.find({
    _id: { $in: reviews.map((rev: any) => rev.delivery) },
  });
  const buyouts = await Buyout.find({
    _id: { $in: deliveries.map((delivery: any) => delivery.idbuyout) },
  });
  const paymenthistories = await paymenthistory.find({
    type: "reviews",
    basisoperation: { $in: reviews.map((rev: any) => "Отзыв " + rev._id) },
  });

  let publishedFormat = await Promise.all(
    reviews.map(async (review: any) => {
      const format: any = {
        id: review._id,
        name: review.name,
        publicComment: review.publicComment,
        hiddenComment: review.hiddenComment,
        conformityRating: review.conformityRating,
        valuePerMoneyRating: review.valuePerMoneyRating,
        serviceRating: review.serviceRating,
        deliveryRating: review.deliveryRating,
        images: review.images,
        date: review.date,
        status: review.status,
        uuid: review.uuid,
        type: getReviewType(review),
      };

      const delivery = deliveries.find(
        (delivery: any) => delivery._id.valueOf() == review.delivery.valueOf()
      );

      if (delivery) {
        format["buyoutuuid"] = delivery.uuidbuyout;

        const foundBuyout = buyouts.find(
          (buyout: any) => buyout.uuid == delivery.uuidbuyout
        );

        format["article"] = foundBuyout ? foundBuyout.url : "";
        format.product = foundBuyout ? foundBuyout.product : "";
        format.gender = foundBuyout ? foundBuyout.gender : "";
      }

      const history = paymenthistories.find(
        (history: any) => history.basisoperation === "Отзыв " + review._id
      );

      if (history) {
        format.completedDate = history.dataoperation;
      }

      return format;
    })
  );

  if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
    publishedFormat = publishedFormat.filter(
      (rev) => rev.buyoutuuid == searchParse[SelectOptionsReviews.uuidBuyout]
    );
  }

  let searchParseAvailable = search
    ? JSON.parse(search?.toString())
    : undefined;

  if (Object.values(searchParseAvailable)[0] !== "") {
    if (
      Object.keys(searchParseAvailable)[0] == SelectOptionsReviews.uuidBuyout
    ) {
      searchParseAvailable = {
        uuidbuyout: searchParseAvailable.uudidBuyout.replace("#", ""),
      };
      pipeLine.splice(3, 0, { $match: { ...searchParseAvailable } }); // after $project
    } else {
      if (Object.keys(searchParseAvailable)[0] === "article") {
        searchParseAvailable.article = Number(searchParseAvailable.article);
      }
      pipeLine.splice(1, 0, { $match: { ...searchParseAvailable } }); // after $match
    }
  }

  // if (skipA > 0) pipeLine.push({ $skip: skipA })
  // if (limitA > 0) pipeLine.push({ $limit: limitA })

  const readyForReview = await Delivery.aggregate(pipeLine);
  if (!readyForReview) return [];

  const soonForReview = await Delivery.aggregate([
    {
      $match: {
        user: new ObjectId(user._id),
        status: "active",
        reviewed: false,
      },
    },
    {
      $group: {
        _id: "$article",
        count: { $sum: 1 },
      },
    },
  ]);

  const sex = (gender: string): string => {
    if (gender && gender.length > 0) {
      return gender.split(" ")[0];
    }
    return "Нет";
  };
  const formatedAvailable = readyForReview.map((deliveryForReview: any) => {
    
    const countSoon = soonForReview.filter(
      (sfr) => sfr._id == deliveryForReview.article
    );
    return {
      ...deliveryForReview,
      countSoon: countSoon.length > 0 ? countSoon[0].count : 0,
      delivs: deliveryForReview.delivs.map((delivery: any) => {
        return {
          ...delivery,
          sex: sex(delivery.recipient),
        };
      }),
    };
  });

  return {
    reviews: publishedFormat,
    availableReviews: formatedAvailable,
  };
});

// refactor all this
