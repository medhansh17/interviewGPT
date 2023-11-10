import { Outlet } from "@tanstack/react-router";
import { Nav } from "./Nav";

export function Root() {
	return (
		<>
			<Nav />
			<Outlet />
		</>
	);
}
