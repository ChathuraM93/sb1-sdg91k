import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchOrdersProps {
  onSearch: (query: string) => void;
}

const SearchOrders: React.FC<SearchOrdersProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search orders..."
        className="flex-grow rounded-l-md border-gray-300 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <Search size={20} />
      </button>
    </form>
  );
};

export default SearchOrders;