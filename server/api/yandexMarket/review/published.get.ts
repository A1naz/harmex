import { SelectOptionsReviews } from "@/data/enums";
import { Review } from "~~/server/lib/models/yandexMarket/Review";
import { ObjectId } from "mongodb";
import { Delivery } from "~/server/lib/models/yandexMarket/Delivery";
import { Buyout } from "~/server/lib/models/yandexMarket/Buyout";
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
          $lt: new Date(new Date().setHours(23, 59, 59)),
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
    // eslint-disable-next-line eqeqeq
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
  } else {
    const foundDelivery = await Delivery.findOne({
      uuidbuyout: searchParse[SelectOptionsReviews.uuidBuyout],
    });
    if (foundDelivery) {
      query = Object.assign(query, { delivery: foundDelivery._id });
    }
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
        videoKey: review.videoKey,
        isVideoEnabled: review.isVideoEnabled,
        isPhotoEnabled: review.isPhotoEnabled,
        createdAt: review.createdAt,
        // Измененные поля
        textEdited: review.textEdited,
        positiveEdited: review.positiveEdited,
        negativeEdited: review.negativeEdited,
        ratingEdited: review.ratingEdited,
        imagesEdited: review.imagesEdited,
        videoKeyEdited: review.videoKeyEdited,
        originalVideoNameEdited: review.originalVideoNameEdited,
        isPhotoEnabledEdited: review.isPhotoEnabledEdited,
        isVideoEnabledEdited: review.isVideoEnabledEdited,
        publishDateEdited: review.publishDateEdited,
        editedAt: review.editedAt,
      };

      // eslint-disable-next-line eqeqeq
      const delivery = deliveries.find(
        (delivery: any) => delivery._id.valueOf() == review.delivery.valueOf()
      );
      if (delivery) {
        format.buyoutuuid = delivery.uuidbuyout;
        format.delivery = { _id: delivery._id };
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

  // eslint-disable-next-line eqeqeq
  if (Object.keys(searchParse)[0] == SelectOptionsReviews.uuidBuyout) {
    // eslint-disable-next-line eqeqeq
    format = format.filter(
      (rev) => rev.buyoutuuid == searchParse[SelectOptionsReviews.uuidBuyout]
    );
  }

  return {
    reviews: format,
  };
});

// refactor all this
