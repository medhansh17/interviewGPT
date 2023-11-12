import { Route } from "@tanstack/react-router";
import { rootRoute } from "../router/rootRoute";
import App from "@/App";

export const appRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/app",
	component: App,
});
