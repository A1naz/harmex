import { Review } from "~~/server/lib/models/goldApple/Review";
import { Delivery } from "~/server/lib/models/goldApple/Delivery";
import { Buyout } from "~/server/lib/models/goldApple/Buyout";
import { ObjectId } from "mongodb";
import { SelectOptionsReviews } from "@/data/enums";
import { paymenthistory } from "~/server/lib/models/Paymenthistory";

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
          $lt: new Date(new Date().setHours(23, 59, 59)).setHours(0, 0, 0),
        },
      };
      break;
    case "2days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
            0,
            0,
            0
          ),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
    case "3days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 2)).setHours(
            0,
            0,
            0
          ),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
      break;
    case "7days":
      dateQuery = {
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 6)).setHours(
            0,
            0,
            0
          ),
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

  if (tab === "all") {
    reviews = await Review.find({ ...query, ...dateQuery })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  } else if (tab === "work") {
    query = Object.assign(query, {
      status: { $in: ["created", "working", "waiting", "work"] },
    });
    reviews = await Review.find({ ...query, ...dateQuery })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  } else if (tab) {
    query = Object.assign(query, { status: tab.toString() });
    reviews = await Review.find({ ...query, ...dateQuery })
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  }

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

  let format = await Promise.all(
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
    format = format.filter(
      (rev) => rev.buyoutuuid == searchParse[SelectOptionsReviews.uuidBuyout]
    );
  }

  return {
    reviews: format,
  };
});

// refactor all this
