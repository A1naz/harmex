import fs from "node:fs";
import { PVZ } from "~/server/lib/models/avito/PVZ";

export default eventHandler(async (event) => {
  const session = (await getAdminEntity(event)) as any;

  if (!session) return sendRedirect(event, "/auth", 302);

  const points: any = await PVZ.find();

  const avitoPickpoints = points.filter((item: any) =>
    item.name.includes("Авито")
  );
  const DPDPickpoints = points.filter((item: any) => item.name.includes("DPD"));
  const SDEKPickpoints = points.filter((item: any) =>
    item.name.includes("СДЭК")
  );
  const BoxberryPickpoints = points.filter((item: any) =>
    item.name.includes("Boxberry")
  );
  const RussianPostPickpoints = points.filter(
    (item: any) => item.name.includes("Почта России")
  );

  console.log(
    "avitoPickpoints",
    avitoPickpoints.length,
    "DPDPickpoints",
    DPDPickpoints.length,
    "SDEKPickpoints",
    SDEKPickpoints.length,
    "BoxberryPickpoints",
    BoxberryPickpoints.length,
    "RussianPostPickpoints",
    RussianPostPickpoints.length
  )
  return {
    avitoPickpoints: [],
    DPDPickpoints: [],
    SDEKPickpoints: [],
    BoxberryPickpoints: [],
    RussianPostPickpoints: [],
  };
});
