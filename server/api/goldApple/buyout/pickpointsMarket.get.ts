import fs from "node:fs";
import { PVZ } from "~/server/lib/models/goldApple/PVZ";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;

  if (!session) return sendRedirect(event, "/auth", 302);
  if (fs.existsSync("pvz/goldApplePointsMarket.json")) {
    const cached = fs.readFileSync("pvz/goldApplePointsMarket.json", "utf8");
    const parsed = JSON.parse(cached);

    const now = new Date();
    const diff = now.getTime() - new Date(parsed.updated).getTime();
    if (diff < 1000 * 60 * 60) {
      return sendStream(
        event,
        fs.createReadStream("pvz/goldApplePointsMarket.json")
      );
    }
  }

  const points: any = await PVZ.find({
    name: "Золотое Яблоко",
  });

  const collection = points.map((point: any) => {
    return {
      id: point.pointId,
      lt: point.coordinates.lat,
      lg: point.coordinates.lon,
      address: point.address,
      placeId: point.placeId,
      postcode: point.postcode,
    };
  });

  const cache = {
    updated: new Date(),
    points: collection,
  };
  fs.writeFileSync("pvz/goldApplePointsMarket.json", JSON.stringify(cache));
  return sendStream(
    event,
    fs.createReadStream("pvz/goldApplePointsMarket.json")
  );
});
