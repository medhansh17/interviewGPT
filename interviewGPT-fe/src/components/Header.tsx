import React from 'react'
import { Link } from 'react-router-dom';

const Header = () => {
    return (


        <div className="flex justify-between items-center mx-[3rem]">
            <Link to="/">
                <div className="flex justify-center items-center">
                    <img src="https://media.licdn.com/dms/image/C510BAQEzP4y4oeD4IA/company-logo_200_200/0/1631369563060?e=1707955200&v=beta&t=eRPP7vUWz6dSrImFSLR7JH7LetvvyacUgnP9OlHOeHU" className="w-[8rem]" />
                    {/* <h1>Blue Consultants</h1> */}
                </div>

            </Link>


        </div>
    )
}

export default Header