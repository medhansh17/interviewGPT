import { useCallback, useState } from "react";
import Modal from "react-modal";
import './Loader.css';
Modal.setAppElement("#root");
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '0%',
    transform: 'translate(-50%, -50%)',
    width:"80%",
    borderRadius:"5px",
    boxShadow:'0 2px 9px grey',
	backgroundColor: 'rgb(218 232 242)'
    
  },
};


const pricings = {
	monthly: "monthly",
	quarterly: "quarterly",
	yearly: "yearly",
} as const;

type Pricings = typeof pricings[keyof typeof pricings]

export default function Pricing() {
	const [state, setState] = useState<Pricings>(pricings.monthly);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	
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


const custom={
	display: 'inline-block',
    width: '100%',
    height: 'calc(1.5em + 0.75rem + 2px)',
    padding: '0.375rem 1.75rem 0.375rem 0.75rem',
    fontSize:'1rem',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#495057',
    verticalAlign: 'middle',
	border: '1px solid rgb(206, 212, 218)'
	
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
				<label className="btn btn-outline-primary" style={{zIndex:"0"}} htmlFor="vbtn-radio1">
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
<<<<<<< HEAD
							className="btn btn-outline-primary openModalButton"
=======
							className="btn btn-outline-primary"
							onClick={()=>setModalIsOpen(true)}
>>>>>>> b091fabd4019a01e062ad3047c3192eba194b335
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
<<<<<<< HEAD
						<button type="button" className="btn btn-outline-primary openModalButton">
=======
						<button type="button" className="btn btn-outline-primary" onClick={()=>setModalIsOpen(true)}>
>>>>>>> b091fabd4019a01e062ad3047c3192eba194b335
							Contact Us
						</button>
					</div>
					<div className="pricing-card" style={{  }}>
						<h3>Custom Plan- Talk to us</h3>
						<h4 className="scroll-m-20 text-l tracking-tight">
							Tailored solutions to fit your organisation's unique needs,
							including advanced integration, unlimited user logins, and
							priority support.
						</h4>
						<br />
<<<<<<< HEAD
						<button type="button" className="btn btn-outline-primary openModalButton">
=======
						<button type="button" className="btn btn-outline-primary" onClick={()=>setModalIsOpen(true)}>
>>>>>>> b091fabd4019a01e062ad3047c3192eba194b335
							Contact Us
						</button>
					</div>
				</div>
			</div>
<<<<<<< HEAD

=======
			<Modal
        isOpen={modalIsOpen}
        style={customStyles}
      >
        <div className='form-cancel-btn'>
        <button onClick={()=>setModalIsOpen(false)} className="modal-close cursor">X</button>
        </div>
       <div className="container pt-5 pb-5 form-style" style={{paddingBottom:"5% !important"}}>
      <h3 className="text-left paddtop5 paddbtn5 text-uppercase display-4 design-title" style={{color:"#0B67BC",lineHeight:"44px",fontWeight:"bold",fontSize:"36px"}}>Let's Connect</h3>
	  <p className="text-left mb-5" style={{marginTop:"1.5%",fontWeight:"normal",fontSize:"24px",lineHeight:"29px",color:"#696969"}}>
	  Contact our support team or make an appointment with our experts
	  </p>
	  <div className="w-100 mx-auto">
		<form className="needs-validation" action="https://getform.io/f/lbjnkgzb" name="popupcontact" method="POST">
          <div className="form-row flex mx-1.5">
            <div className="col-md-4 mb-3 px-1.5">
              <label>
				Full Name
				<span>*</span>
			  </label>
			  <input type="text" className="form-control text-field-bg"  id="fullname" required/>
			  
			</div>
			<div className="col-md-4 mb-3 px-1.5">
              <label>
				Email
				<span>*</span>
			  </label>
			  <input type="email" className="form-control text-field-bg"  id="fullname" required/>
			  
			</div>
			<div className="col-md-4 mb-3 px-1.5">
              <label>
				Phone Number
				<span>*</span>
			  </label>
			  <input type="number" className="form-control text-field-bg"  id="fullname" required/>
			  
			</div>

		  </div>
		  <div className="form-row mx-1.5">
             <div className="col-md-12 mb-3 px-1.5">
               <label>Subject</label>
			   <select style={custom} >
				<option selected disabled >Choose...</option>
				<option>Silver Plan</option>
				<option>Gold Plan</option>
				<option>Custom Plan</option>
			   </select>
			 </div>
			 <div>
				<label style={{display:"inline-block"}}>Message</label>
				<textarea name="description" required rows={5} className="form-control text-field-bg" style={{height:"auto",width: '100%',
    }} />
			 </div>
		  </div>
		  {/* <div className="flex justify-center mt-3  "> */}
		  <button type="submit" className="flex align-center py-1.5 px-3 mt-3 ml-2 rounded-sm" style={{backgroundColor:"#0B67BC",color:"white"}}>Send</button>
		  {/* </div> */}
		  
		</form>
	  </div>
	   </div>
      </Modal>
>>>>>>> b091fabd4019a01e062ad3047c3192eba194b335
		</section>
		
	);
}
