import { Outlet } from "@tanstack/react-router";
import React from "react";
import { NavigationMenuComponent } from "./Nav";

export function Root() {
  return (
    <>
      <Outlet />
    </>
  );
}
