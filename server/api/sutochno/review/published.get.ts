import { Review } from "~~/server/lib/models/sutochno/Review";
import { Delivery } from "~/server/lib/models/sutochno/Delivery";
import { Buyout } from "~/server/lib/models/sutochno/Buyout";
import { ObjectId } from "mongodb";
import { SelectOptionsReviews } from "@/data/enums";

export default eventHandler(async (event) => {
  const user = await getAdminEntity(event);
  if (!user) return sendRedirect(event, "/auth", 302);

  const { skip, limit, tab, search } = getQuery(event);

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
  } else {
    const foundDelivery = await Delivery.findOne({
      uuidbuyout: searchParse[SelectOptionsReviews.uuidBuyout],
    });
    if (foundDelivery) {
      query = Object.assign(query, { delivery: foundDelivery._id });
    }
  }

  if (tab === "all") {
    reviews = await Review.find(query)
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  } else if (tab === "work") {
    query = Object.assign(query, {
      status: { $in: ["created", "working", "waiting", "work"] },
    });
    reviews = await Review.find(query)
      .sort({ _id: -1 })
      .skip((skip as number) || 0)
      .limit((limit as number) || 0);
  } else if (tab) {
    query = Object.assign(query, { status: tab.toString() });
    reviews = await Review.find(query)
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
        url: review.url,
        deliveryRating: review.deliveryRating,
        images: review.images,
        date: review.publishDate ? review.publishDate : review.date,
        status: review.status,
        uuid: review.uuid,
      };

      const delivery = deliveries.find(
        (delivery: any) => delivery._id.valueOf() == review.delivery.valueOf()
      );

      if (delivery) {
        format["buyoutuuid"] = delivery.uuidbuyout;
        format.recipient = delivery.recipient;

        const foundBuyout = buyouts.find(
          (buyout: any) => buyout.uuid == delivery.uuidbuyout
        );

        format["article"] = foundBuyout ? foundBuyout.url : "";
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
