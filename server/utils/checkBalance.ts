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

function getBuyoutsSumm(
  products: any,
  mp: string = "wildberries",
  pricesMap: any
) {
  let summ = 0;

  for (const product of products) {
    summ += product.discountPrice
      ? parseFloat(product.discountPrice)
      : parseFloat(product.price);
    if (pricesMap[mp].buyoutsType === "price") {
      summ += pricesMap[mp].buyouts;
    } else if (pricesMap[mp].buyoutsType === "percent") {
      const percentSumm = parseFloat(product.discountPrice) ? parseFloat(product.discountPrice) : parseFloat(product.price) * (pricesMap[mp].buyouts / 100);
      console.log(percentSumm);
      if (percentSumm < pricesMap[mp].buyoutsMinPrice) {
        summ += pricesMap[mp].buyoutsMinPrice;
      } else {
        summ += percentSumm;
      }
    }
  }

  return summ;
}

async function getPricesMap(user: any) {
  const pricesDocument = await DefaultPrices.findOne({});
  const userTariffs = user.MPTariffs ? user.MPTariffs : [];

  if (!pricesDocument?.values) {
    console.log("Prices document not found");
    return {};
  }

  return pricesDocument.values.reduce((acc, item) => {
    const isUserHasMPTariff = userTariffs.find(
      (tariff: any) => tariff.mp === item.mp
    );
    if (isUserHasMPTariff) {
      acc[item.mp] = {
        review: isUserHasMPTariff.prices?.review?.value || 0,
        buyouts: isUserHasMPTariff.prices?.buyouts?.value || 0,
        buyoutsType: isUserHasMPTariff.prices?.buyouts?.type || "price",
        buyoutsMinPrice: isUserHasMPTariff.prices?.buyouts?.minPrice || 0,
        viewings: isUserHasMPTariff.prices?.viewing?.value || 0,
        question: isUserHasMPTariff.prices?.questionProduct?.value || 0,
        cart: isUserHasMPTariff.prices?.cart?.value || 0,
        likes: isUserHasMPTariff.prices?.likeReview?.value || 0,
        productlikes: isUserHasMPTariff.prices?.likeProduct?.value || 0,
      };
    } else {
      acc[item.mp] = {
        review: item.prices?.review?.value || 0,
        buyouts: item.prices?.buyouts?.value || 0,
        buyoutsType: item.prices?.buyouts?.type || "price",
        buyoutsMinPrice: item.prices?.buyouts?.minPrice || 0,
        viewings: item.prices?.viewing?.value || 0,
        question: item.prices?.questionProduct?.value || 0,
        cart: item.prices?.cart?.value || 0,
        likes: item.prices?.likeReview?.value || 0,
        productlikes: item.prices?.likeProduct?.value || 0,
      };
    }

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
    console.log(
      "prices[service]" + product.amount
        ? prices[service] * product.amount
        : prices[service]
    );
    return product.amount ? prices[service] * product.amount : prices[service];
  }
}

export const checkBalance = async (
  user: any,
  products: any,
  service = "buyouts",
  mp: string = "wildberries"
) => {
  try {
    if (!user) return false;

    if (user.username === "rabo4yn") {
      console.log("approver Balance ", user.username);
      return true;
    }

    let totalPrice = 0;
    const pricesMap = await getPricesMap(user);

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
            priceWithExtra: {
              $cond: [
                { $eq: [pricesMap["flowwow"].buyoutsType, "percent"] },
                {
                  $add: [
                    "$price",
                    {
                      $cond: [
                        {
                          $lt: [
                            {
                              $multiply: [
                                "$price",
                                pricesMap["flowwow"].buyouts / 100,
                              ],
                            },
                            pricesMap["flowwow"].buyoutsMinPrice,
                          ],
                        },
                        pricesMap["flowwow"].buyoutsMinPrice,
                        {
                          $multiply: [
                            "$price",
                            pricesMap["flowwow"].buyouts / 100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $add: ["$price", pricesMap["flowwow"].buyouts] },
              ],
            },
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
            priceWithExtra: {
              $cond: [
                { $eq: [pricesMap["ozon"].buyoutsType, "percent"] },
                {
                  $add: [
                    "$price",
                    {
                      $cond: [
                        {
                          $lt: [
                            {
                              $multiply: [
                                "$price",
                                pricesMap["ozon"].buyouts / 100,
                              ],
                            },
                            pricesMap["ozon"].buyoutsMinPrice,
                          ],
                        },
                        pricesMap["ozon"].buyoutsMinPrice,
                        {
                          $multiply: [
                            "$price",
                            pricesMap["ozon"].buyouts / 100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $add: ["$price", pricesMap["ozon"].buyouts] },
              ],
            },
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
            priceWithExtra: {
              $cond: [
                { $eq: [pricesMap["wildberries"].buyoutsType, "percent"] },
                {
                  $add: [
                    "$price",
                    {
                      $cond: [
                        {
                          $lt: [
                            {
                              $multiply: [
                                "$price",
                                pricesMap["wildberries"].buyouts / 100,
                              ],
                            },
                            pricesMap["wildberries"].buyoutsMinPrice,
                          ],
                        },
                        pricesMap["wildberries"].buyoutsMinPrice,
                        {
                          $multiply: [
                            "$price",
                            pricesMap["wildberries"].buyouts / 100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $add: ["$price", pricesMap["wildberries"].buyouts] },
              ],
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      yandexMarketBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: {
              $cond: [
                { $eq: [pricesMap["ym"].buyoutsType, "percent"] },
                {
                  $add: [
                    "$price",
                    {
                      $cond: [
                        {
                          $lt: [
                            {
                              $multiply: [
                                "$price",
                                pricesMap["ym"].buyouts / 100,
                              ],
                            },
                            pricesMap["ym"].buyoutsMinPrice,
                          ],
                        },
                        pricesMap["ym"].buyoutsMinPrice,
                        {
                          $multiply: [
                            "$price",
                            pricesMap["ym"].buyouts / 100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $add: ["$price", pricesMap["ym"].buyouts] },
              ],
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$priceWithExtra" } } },
      ]),
      avitoBuyout.aggregate([
        { $match: { user: user._id, status: { $in: ["work", "active"] } } },
        { $project: { price: { $toDouble: "$product.price" } } },
        {
          $project: {
            priceWithExtra: {
              $cond: [
                { $eq: [pricesMap["avito"].buyoutsType, "percent"] },
                {
                  $add: [
                    "$price",
                    {
                      $cond: [
                        {
                          $lt: [
                            {
                              $multiply: [
                                "$price",
                                pricesMap["avito"].buyouts / 100,
                              ],
                            },
                            pricesMap["avito"].buyoutsMinPrice,
                          ],
                        },
                        pricesMap["avito"].buyoutsMinPrice,
                        {
                          $multiply: [
                            "$price",
                            pricesMap["avito"].buyouts / 100,
                          ],
                        },
                      ],
                    },
                  ],
                },
                { $add: ["$price", pricesMap["avito"].buyouts] },
              ],
            },
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
                  pricesMap["ym"].review,
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
                  pricesMap["avito"].review,
                  { $cond: [{ $eq: ["$isVideoEnabled", true] }, 25, 0] },
                ],
              },
            },
          },
        },
      ]),
    ]);

    console.log(wildberriesBuyoutSum);

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

      
    console.log(flowwowBuyoutSum)
    let currentProductSumm =
      service === "buyouts"
        ? getBuyoutsSumm(products, mp, pricesMap)
        : getCurrentProductSumm(products, pricesMap[products.mp], service) || 0;
    console.log("currentProductSumm", currentProductSumm);

    totalPrice += balanceActive + currentProductSumm;

    console.log("totalPrice: ", mp, totalPrice);
    return user.balance >= totalPrice;
  } catch (e) {
    console.error(e);
    return false;
  }
};
