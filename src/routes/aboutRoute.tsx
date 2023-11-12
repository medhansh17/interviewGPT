import { Route } from "@tanstack/react-router";
import { About } from "../pages/about";
import { rootRoute } from "../router/rootRoute";

export const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: About,
});
