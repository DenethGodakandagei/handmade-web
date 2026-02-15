
import React from 'react';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center h-full w-full">
            <div className="relative w-6 h-6">
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-gray-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-[1px] border-transparent border-t-black rounded-full animate-spin"></div>
            </div>
        </div>
    );
};

export default Spinner;
