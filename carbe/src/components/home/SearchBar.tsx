import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

const SearchBar = () => {
  return (
    <div className="bg-white shadow-lg rounded-full p-3 flex items-center w-full mx-4 my-3">
      <Search className="h-5 w-5 text-red-500 ml-3 mr-2 flex-shrink-0" />
      <input
        type="text"
        placeholder="Start your search"
        className="flex-grow bg-transparent focus:outline-none text-gray-800 placeholder-gray-500 text-sm"
      />
      <button className="p-2 hover:bg-gray-100 rounded-full ml-2 flex-shrink-0">
        <SlidersHorizontal className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
};

export default SearchBar; 