import fs from "node:fs";
import { PVZ } from "~/server/lib/models/wildberries/PVZ";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;

  if (!session) return sendRedirect(event, "/auth", 302);
  if (fs.existsSync("pvz/wildberriesPoints.json")) {
    const cached = fs.readFileSync("pvz/wildberriesPoints.json", "utf8");
    const parsed = JSON.parse(cached);

    const now = new Date();
    const diff = now.getTime() - new Date(parsed.updated).getTime();
    if (diff < 1000 * 60 * 60) {
      return sendStream(
        event,
        fs.createReadStream("pvz/wildberriesPoints.json")
      );
    }
  }

  const points = await PVZ.aggregate([
    {
      $group: {
        _id: { lt: "$lt", lg: "$lg" }, // Группируем по полям lt и lg
        id: { $first: "$id" }, // Берем первое значение id для каждой группы
        w: { $first: "$w" }, // Берем первое значение w для каждой группы
        a: { $first: "$a" }, // Берем первое значение a для каждой группы
      },
    },
    {
      $project: {
        _id: 0, // Исключаем поле _id из результата
        id: 1,
        lt: "$_id.lt", // Возвращаем lt из группировки
        lg: "$_id.lg", // Возвращаем lg из группировки
        w: 1,
        a: 1,
      },
    },
  ]);

  if (!points || points.length < 50000) {
    return sendStream(event, fs.createReadStream("pvz/wildberriesPoints.json"));
  }

  const cache = {
    updated: new Date(),
    points: points,
  };

  fs.writeFileSync("pvz/wildberriesPoints.json", JSON.stringify(cache));
  return sendStream(event, fs.createReadStream("pvz/wildberriesPoints.json"));
});
