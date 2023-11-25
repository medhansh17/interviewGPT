import { useState } from 'react';

const Popover = ({ data }: any) => {
    const [isHovered, setIsHovered] = useState(false);

    const getPositionClass = () => {
        const windowWidth = window.innerWidth;
        // You can adjust the threshold value as needed
        const threshold = 300;

        if (windowWidth < threshold) {
            return 'left-0';
        } else {
            return 'right-0';
        }
    };

    return (
        <div className="relative group inline-block cursor-pointer">
            <button
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`cursor-pointer ${isHovered ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded-full p-2`}
            >
                <img width="18" height="18" src="https://img.icons8.com/ios/50/information--v1.png" alt="circled-i" />
            </button>

            {isHovered && (
                <div
                    className={`opacity-100 visible absolute md:w-[35rem] mt-2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-2 z-10 ${getPositionClass()}`}
                >
                    <p className="px-4 py-2">{data}</p>
                </div>
            )}
        </div>
    );
};

export default Popover;
