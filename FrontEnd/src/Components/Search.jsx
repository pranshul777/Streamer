import React, { useState } from 'react';

const Search = () => {
    const [searchTxt, setSearchTxt] = useState("");

    return (
        <div className='flex items-center justify-center w-full'>
            <div className='flex h-10 w-[500px] border border-gray-300 rounded-full overflow-hidden shadow-sm'>
                {/* Search Input */}
                <input 
                    className='flex-grow px-4 py-2 text-sm outline-none'
                    placeholder='Search'
                    value={searchTxt}
                    onChange={(e) => setSearchTxt(e.target.value)}
                />

                {/* Search Button */}
                <button className="w-16 bg-gray-100 flex justify-center items-center hover:bg-gray-200">
                    <svg className="w-5 h-5 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default Search;
