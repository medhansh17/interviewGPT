import { appRoute } from "@/routes/appRoute";
import { aboutRoute } from "../routes/aboutRoute";
import { indexRoute } from "../routes/indexRoute";
import { rootRoute } from "./rootRoute";

export const routeTree = rootRoute.addChildren([indexRoute, aboutRoute, appRoute]);
