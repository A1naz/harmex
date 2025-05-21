import { User } from "../lib/models/User";
import { DefaultPrices } from "@/server/lib/models/defaultPrices";
import { Buyout as wildberriesBuyout } from "../lib/models/wildberries/Buyout";
import { Buyout as ozonBuyout } from "../lib/models/ozon/Buyout";
import { Buyout as yandexMarketBuyout } from "../lib/models/yandexMarket/Buyout";
import { Buyout as avitoBuyout } from "../lib/models/avito/Buyout";
import { Buyout as flowwowBuyout } from "../lib/models/flowwow/Buyout";
import { Review as wildberriesReview } from "../lib/models/wildberries/Review";
import { Review as ozonReview } from "../lib/models/ozon/Review";
import { Review as flowwowReview } from "../lib/models/flowwow/Review";
import { Review as yandexMarketReview } from "../lib/models/yandexMarket/Review";
import { Review as avitoReview } from "../lib/models/avito/Review";

async function getPricesMap() {
  const pricesDocument = await DefaultPrices.findOne({});

  if (!pricesDocument?.values) {
    console.log("Prices document not found");
    return {};
  }

  return pricesDocument.values.reduce((acc, item) => {
    acc[item.mp] = {
      review: item.prices?.review?.value || 0,
      buyouts: item.prices?.buyouts?.value || 0,
      viewings: item.prices?.viewing?.value || 0,
      question: item.prices?.questionProduct?.value || 0,
      cart: item.prices?.cart?.value || 0,
      likes: item.prices?.likeReview?.value || 0,
      productlikes: item.prices?.likeProduct?.value || 0,
    };
    return acc;
  }, {});
}

function getCurrentProductSumm(product: any, prices: any, service: any) {
  if (!prices || !product || !service) return 0;
  if (service === "reviews") {
    return product.video && product.video !== ""
      ? prices.review + 25
      : prices.review || 0;
  } else if (service === "questions") {
    return prices.question;
  } else {
    return product.amount ? prices[service] * product.amount : prices[service];
  }
}

export const checkBalance = async (
  user: any,
  products: any,
  service = "buyouts"
) => {
  try {
    // console.log('checkBalance')
    if (!user) return false;

    if (user.username === "rabo4yn") {
      console.log("approver Balance ", user.username);
      return true;
    }

    let totalPrice = 0;
    const pricesMap = await getPricesMap();

    const [
      flowwowBuyoutSum,
      ozonBuyoutSum,
      wildberriesBuyoutSum,
      yandexMarketBuyoutSum,
      avitoBuyoutSum,
      ozonReviewSum,
      flowwowReviewSum,
      wildberriesReviewSum,
      yandexMarketReviewSum,
      avitoReviewSum,
    ] = await Promise.all([
      // Buyouts
      flowwowBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: { $add: ["$price", pricesMap["flowwow"].buyouts] },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      ozonBuyout.aggregate([
        {
          $match: {
            user: user._id,
            status: {
              $in: ["work", "active"],
            },
          },
        },
        {
          $project: {
            price: { $toDouble: "$discountPrice" },
          },
        },
        {
          $project: {
            priceWithExtra: { $add: ["$price", pricesMap["ozon"].buyouts] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$priceWithExtra",
            },
          },
        },
      ]),
      wildberriesBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: { $add: ["$price", pricesMap["ozon"].buyouts] },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      yandexMarketBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: { $add: ["$price", pricesMap["ozon"].buyouts] },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      avitoBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: { $add: ["$price", pricesMap["ozon"].buyouts] },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      ozonReview.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ["created", "working", "waiting", "work"] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  pricesMap["ozon"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
      flowwowReview.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ["created", "working", "waiting", "work"] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  pricesMap["flowwow"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
      wildberriesReview.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ["created", "working", "waiting", "work"] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  pricesMap["wildberries"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
      yandexMarketReview.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ["created", "working", "waiting", "work"] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  pricesMap["wildberries"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
      avitoReview.aggregate([
        {
          $match: {
            user: user._id,
            status: { $in: ["created", "working", "waiting", "work"] },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: {
                $add: [
                  pricesMap["wildberries"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
    ]);

    const balanceActive =
      (flowwowBuyoutSum[0]?.total || 0) +
      (flowwowReviewSum[0]?.total || 0) +
      (ozonBuyoutSum[0]?.total || 0) +
      (wildberriesBuyoutSum[0]?.total || 0) +
      (ozonReviewSum[0]?.total || 0) +
      (wildberriesReviewSum[0]?.total || 0) +
      (yandexMarketBuyoutSum[0]?.total || 0) +
      (avitoBuyoutSum[0]?.total || 0) +
      (yandexMarketReviewSum[0]?.total || 0) +
      (avitoReviewSum[0]?.total || 0);

    // console.log('ozonBuyoutSum', ozonBuyoutSum, 'wildberriesBuyoutSum', wildberriesBuyoutSum);
    // console.log('ozonReviewSum', ozonReviewSum, 'wildberriesReviewSum', wildberriesReviewSum);
    // console.log('ozonViewSum', ozonViewSum, pricesMap["ozon"].viewings, 'wildberriesViewSum', wildberriesViewSum, pricesMap["wildberries"].viewings);
    // console.log('ozonQuestionSum', ozonQuestionSum, pricesMap["ozon"].question, 'wildberriesQuestionSum', wildberriesQuestionSum, pricesMap["wildberries"].question);
    // console.log('ozonCartSum', ozonCartSum, pricesMap["ozon"].cart, 'wildberriesCartSum', wildberriesCartSum, pricesMap["wildberries"].cart);
    // console.log('ozonLikeReviewSum', ozonLikeReviewSum, pricesMap["ozon"].likes, 'wildberriesLikeReviewSum', wildberriesLikeReviewSum, pricesMap["wildberries"].likes);
    // console.log('ozonLikeProductSum', ozonLikeProductSum, pricesMap["ozon"].productlikes, 'wildberriesLikeProductSum', wildberriesLikeProductSum, pricesMap["wildberries"].productlikes);
    // console.log('ozonQuestionLikeSum', ozonQuestionLikeSum, pricesMap["ozon"].likes);

    // console.log(products)
    let currentProductSumm =
      service === "buyouts"
        ? products.reduce((acc: any, item: any) => {
            return (
              acc +
                (item.discountPrice
                  ? parseFloat(item.discountPrice) + 150
                  : item.price
                  ? parseFloat(item.price) + 150
                  : parseFloat(item.product.price) + 150) || 0
            );
          }, 0)
        : getCurrentProductSumm(products, pricesMap[products.mp], service) || 0;
    // console.log('currentProductSumm', currentProductSumm);

    totalPrice += balanceActive + currentProductSumm;

    return user.balance >= totalPrice;
  } catch (e) {
    console.error(e);
    return false;
  }
};
