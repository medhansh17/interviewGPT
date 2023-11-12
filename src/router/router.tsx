import { Router } from "@tanstack/react-router";
import { routeTree } from "./routeTree";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const router = new Router({ routeTree });
