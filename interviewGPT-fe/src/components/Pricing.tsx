import { useCallback, useState } from "react";

const pricings = {
	monthly: "monthly",
	quarterly: "quarterly",
	yearly: "yearly",
} as const;

type Pricings = typeof pricings[keyof typeof pricings]

export default function Pricing() {
	const [state, setState] = useState<Pricings>(pricings.monthly);
	const handleRadioClick: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
		setState(e.target.value as Pricings);
	}, []);
	let silverPlan = 79;
	let goldPlan = 239;
	if (state === "quarterly") {
		silverPlan -= (silverPlan * 33 / 100)
		goldPlan -= (goldPlan * 33 / 100)
	}

	if (state === "yearly") {
		silverPlan -= (silverPlan * 50 / 100)
		goldPlan -= (goldPlan * 50 / 100)
	}

	return (
		<section className="pricing mt-16 w-full" >
			{/* <h2 className="text-[3.5rem] text-[#3388CC] font-semibold  font-roboto flex justify-center mb-4 mt-[5rem]">Choose the plan that best fits your needs</h2> */}
			<div
				className="btn-group mx-auto block"
				role="group"
				aria-label="radio toggle button group"
			>
				<input
					onChange={handleRadioClick}
					type="radio"
					className="btn-check"
					name="vbtn-radio"
					id="vbtn-radio1"
					autoComplete="off"
					checked={state === 'monthly'}
					value={pricings.monthly}
				/>
				<label className="btn btn-outline-primary" htmlFor="vbtn-radio1">
					Monthly
				</label>
				{/* <input
					onChange={handleRadioClick}
					type="radio"
					className="btn-check"
					name="vbtn-radio"
					id="vbtn-radio2"
					autoComplete="off"
					value={pricings.quarterly}
					checked={state === 'quarterly'}
				/>
				<label className="btn btn-outline-primary" htmlFor="vbtn-radio2">
					Quarterly save 33%
				</label> */}
				{/* <input
					onChange={handleRadioClick}
					type="radio"
					className="btn-check"
					name="vbtn-radio"
					id="vbtn-radio3"
					autoComplete="off"
					value={pricings.yearly}
					checked={state === 'yearly'}
				/>
				<label className="btn btn-outline-primary" htmlFor="vbtn-radio3">
					Yearly save 50%
				</label> */}
			</div>
			<br />
			<br />
			<div className="container" data-aos="fade-up">
				<div className="pricing-grid my-5">
					<div className="pricing-card">
						<h3>Silver Plan</h3>
						<br />
						<h3 >
						<span className="line-through">$100</span>  - ${silverPlan}<sup> per user / month</sup>
						</h3>
						<br />
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />
							&nbsp;AI Resume Matching
						</p>
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />
							&nbsp;AI Assessment Generation
						</p>
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />{" "}
							&nbsp;Single User Login
						</p>
						<br />
						<p>
							Ideal for: Small teams or solo recruiters looking to automate the
							initial stages of the recruitment process.
						</p>
						<br />
						<button
							id="free-btn"
							type="button"
							className="btn btn-outline-primary openModalButton"
						>
							Contact us
						</button>
					</div>
					<div className="pricing-card">
						<h3>Gold Plan</h3>
						<br />
						<h3>
						<span className="line-through">$1000</span>  - ${goldPlan}<sup>per user / month</sup>
						</h3>
						<br />
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />{" "}
							No All Silver Plan features
						</p>
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />{" "}
							AI Assessment Evaluation
						</p>
						<p>
							<i className="bi bi-check-circle" style={{ color: "#0b67bc" }} />{" "}
							Full Multi-user Login (up to 7 users)
						</p>
						<br />
						<p>
							Ideal for: Growing teams requiring deeper analysis and
							collaboration in their recruitment efforts.
						</p>
						<br />
						<button type="button" className="btn btn-outline-primary openModalButton">
							Contact Us
						</button>
					</div>
					<div className="pricing-card" style={{ zIndex: 10 }}>
						<h3>Custom Plan- Talk to us</h3>
						<h4 className="scroll-m-20 text-l tracking-tight">
							Tailored solutions to fit your organisation's unique needs,
							including advanced integration, unlimited user logins, and
							priority support.
						</h4>
						<br />
						<button type="button" className="btn btn-outline-primary openModalButton">
							Contact Us
						</button>
					</div>
				</div>
			</div>

		</section>
	);
}
