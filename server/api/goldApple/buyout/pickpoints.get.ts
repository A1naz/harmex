import fs from "node:fs";
import { PVZ } from "~/server/lib/models/goldApple/PVZ";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;

  if (!session) return sendRedirect(event, "/auth", 302);
  let points: any = [];
  // if (fs.existsSync("pvz/goldApplePoints.json")) {
  //   const cached = fs.readFileSync("pvz/goldApplePoints.json", "utf8");
  //   const parsed = JSON.parse(cached);

  //   const now = new Date();
  //   const diff = now.getTime() - new Date(parsed.updated).getTime();
  //   if (diff < 1000 * 60 * 60) {
  //     points = JSON.parse(cached).points;
  //     console.log("points from cache");
  //   }
  // } else {
  points = await PVZ.find({ name: { $exists: true } });
  console.log(points);
  // }

  const pickpoints: any[] = [];
  const pickpoints5Post: any[] = [];
  const pickpointsYandex: any[] = [];
  const pickpointsMarket: any[] = [];

  const collection = points.map((point: any) => {
    if (point.coordinates && point.coordinates.lat && point.coordinates.lon) {
      if (point.name == "ПВЗ Золотое Яблоко") {
        pickpoints.push({
          id: point.placeId,
          lt: point.coordinates.lat,
          lg: point.coordinates.lon,
          address: point.address,
          placeId: point.placeId,
          postcode: point.postcode,
        })
      } else if (point.name == "5Post") {
        pickpoints5Post.push({
          id: point.placeId,
          lt: point.coordinates.lat,
          lg: point.coordinates.lon,
          address: point.address,
          placeId: point.placeId,
          postcode: point.postcode,
        })
      } else if (point.name == "Яндекс Доставка") {
        pickpointsYandex.push({
          id: point.placeId,
          lt: point.coordinates.lat,
          lg: point.coordinates.lon,
          address: point.address,
          placeId: point.placeId,
          postcode: point.postcode,
        })
      } else if (point.name == "Золотое Яблоко") {
        pickpointsMarket.push({
          id: point.placeId,
          lt: point.coordinates.lat,
          lg: point.coordinates.lon,
          address: point.address,
          placeId: point.placeId,
          postcode: point.postcode,
        })
      }
      return {
        id: point.placeId,
        lt: point.coordinates.lat,
        lg: point.coordinates.lon,
        address: point.address,
        placeId: point.placeId,
        postcode: point.postcode,
      };
    }
  });

  const cache = {
    updated: new Date(),
    points: collection,
  };
  fs.writeFileSync("pvz/goldApplePoints.json", JSON.stringify(cache));
  return {
    points: pickpoints,
    pickpoints5Post,
    pickpointsYandex,
    pickpointsMarket,
  };
});
