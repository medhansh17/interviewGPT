import { NavigationMenuComponent } from "@/components/Nav";
import { Button } from "@/components/ui/button";
import React from "react";

export function Home() {
	return (
		<>
			<NavigationMenuComponent />
			<div className="overflow-x-hidden">
				<main className="mt-8 mx-12 grid grid-cols-2 gap-4">
					<section className="">
						<h1 className="text-4xl text-sky-700 mb-6 font-medium">
							InterviewGPT
						</h1>
						<h2 className="text-4xl font-medium mb-8">
							Empowering Recruiters with AI-Driven Interviews
						</h2>
						<p className="mb-2 text-gray-500">
							Revolutionize your hiring process with InterviewGPT
						</p>
						<p className="mb-8 text-gray-500">
							AI-Powered Question Generation for Accurate Candidate Assessment
						</p>
						<Button className="px-12 rounded-none bg-sky-700 uppercase">
							Try Now
						</Button>
					</section>
				</main>
				<br />
				<div
					className="overflow-hidden -translate-y-32 -translate-x-32 w-0 h-0 border-l-[120vw] border-r-[0px] border-b-[300px] border-x-transparent border-solid border-sky-200"
				/>
			</div>
		</>
	);
}
