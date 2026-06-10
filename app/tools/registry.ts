import { Calculator } from "./registry/types";

// 静态导入你目前最稳的三个核心计算器，作为基础细胞胎盘
import { adsenseRevenue } from "./registry/adsense-revenue";
import { appstoreNetTake } from "./registry/appstore-net-take";
import { dpsMultiplier } from "./registry/dps-multiplier";

export const calculatorsRegistry: Record<string, Calculator> = {
  "adsense-revenue": adsenseRevenue,
  "appstore-net-take": appstoreNetTake,
  "dps-multiplier": dpsMultiplier,
};
