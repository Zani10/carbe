import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 w-full bg-[#212121] rounded-b-[35px] pt-5 pb-4 px-4">
      <div className="relative bg-white rounded-full shadow-md flex items-center py-3 px-4 w-full">
        <div className="flex-grow flex justify-center items-center mr-2">
          <Search className="h-5 w-5 text-[#FF4646] mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Start your search"
            className="bg-transparent focus:outline-none text-black placeholder-gray-500 text-base font-normal"
          />
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
          <SlidersHorizontal className="h-5 w-5 text-gray-800" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar; 