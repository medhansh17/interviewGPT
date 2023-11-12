import { Route } from "@tanstack/react-router";
import { rootRoute } from "../router/rootRoute";
import { Home } from "@/pages/Home";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
