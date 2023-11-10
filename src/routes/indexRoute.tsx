import { Route } from "@tanstack/react-router";
import { rootRoute } from "../router/rootRoute";
import App from "../App";

export const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: '/',
	component: App
})

