import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export function NavigationMenuComponent() {
	return (
		<nav className="p-4 flex flex-row items-right justify-end items-center gap-16">
			<img
				src="blueticklogo.png"
				width={150}
				className="mr-auto ml-8 mt-2"
				alt="logo"
			/>
			<Link
				to="/"
				activeProps={{
					style: {
						fontWeight: "bold",
					},
				}}
			>
				Home
			</Link>
			<Link
			>
				Features
			</Link>
			<Link>
				Benefits
			</Link>
			<Button className="bg-sky-700 rounded-none"><Link to="/app">Go To App</Link></Button>
		</nav>
	);
}
