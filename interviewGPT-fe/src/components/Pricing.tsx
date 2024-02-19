export default function Pricing() {
  return (
    <section className="pricing">
      <h2>Choose the plan that best fits your needs</h2>
      <div
        className="btn-group"
        role="group"
        aria-label="radio toggle button group"
      >
        <input
          type="radio"
          className="btn-check"
          name="vbtn-radio"
          id="vbtn-radio1"
          autoComplete="off"
        />
        <label className="btn btn-outline-primary" htmlFor="vbtn-radio1">
          Monthly
        </label>
        <input
          type="radio"
          className="btn-check"
          name="vbtn-radio"
          id="vbtn-radio2"
          autoComplete="off"
        />
        <label className="btn btn-outline-primary" htmlFor="vbtn-radio2">
          Quarterly save 33%
        </label>
        <input
          type="radio"
          className="btn-check"
          name="vbtn-radio"
          id="vbtn-radio3"
          autoComplete="off"
        />
        <label className="btn btn-outline-primary" htmlFor="vbtn-radio3">
          Yearly save 50%
        </label>
      </div>
      <br />
      <br />
      <div className="container">
        <div className="pricing-grid my-5">
          <div className="pricing-card">
            <h3>Silver Plan</h3>
            <br />
            <h3 style={{ alignSelf: "end" }}>
              $79<sup> per user / month</sup>
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
              className="btn btn-outline-primary"
            >
              Contact us
            </button>
          </div>
          <div className="pricing-card">
            <h3>Gold Plan</h3>
            <br />
            <h3>
              $239<sup>per user / month</sup>
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
            <button type="button" className="btn btn-outline-primary">
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
            <button type="button" className="btn btn-outline-primary">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
