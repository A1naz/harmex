import fs from "node:fs";
import { PVZ } from "~/server/lib/models/avito/PVZ";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;

  if (!session) return sendRedirect(event, "/auth", 302);

  const dbPoints: any = await PVZ.find().select(
    "-__v -_id -pointType -dateLastUpdate"
  );

  const points = dbPoints.map((point: any, index: number) => {
    return {
      id: point.pointId,
      name: point.name,
      lt: point.coordinates.lat,
      lg: point.coordinates.lon,
    };
  });

  const avitoPickpoints = points.filter(
    (item: any) =>
      item.name && item.lt && item.lg && item.name.includes("Авито")
  );
  const DPDPickpoints = points.filter(
    (item: any) => item.name && item.lt && item.lg && item.name.includes("DPD")
  );
  const SDEKPickpoints = points.filter(
    (item: any) => item.name && item.lt && item.lg && item.name.includes("СДЭК")
  );
  const BoxberryPickpoints = points.filter(
    (item: any) =>
      item.name && item.lt && item.lg && item.name.includes("Boxberry")
  );
  const RussianPostPickpoints = points.filter(
    (item: any) =>
      item.name && item.lt && item.lg && item.name.includes("Почта России")
  );

  const postamat5PostPickpoints = points.filter(
    (item: any) =>
      item.name && item.lt && item.lg && item.name.includes("Постамат 5Post")
  );

  const cassa5PostPickpoints = points.filter(
    (item: any) =>
      item.name && item.lt && item.lg && item.name.includes("Касса 5Post")
  );

  return {
    avitoPickpoints,
    DPDPickpoints,
    SDEKPickpoints,
    BoxberryPickpoints,
    RussianPostPickpoints,
    postamat5PostPickpoints,
    cassa5PostPickpoints,
  };
});
