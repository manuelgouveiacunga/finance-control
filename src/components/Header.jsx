import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Finance Control</h1>
        <nav className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-gray-300">Inicio</Link>
          <Link to="/reports" className="hover:text-gray-300">Relatórios</Link>
          <Link to="/analytics" className="hover:text-gray-300">Análises</Link>
          <Link to="/goals" className="hover:text-gray-300">Objectivos financeiros</Link>
        </nav>
        <div className="md:hidden">
          {/* Mobile menu button */}
          <button className="text-white focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-2">
          <nav className="flex flex-col space-y-2">
            <Link to="/" className="hover:text-gray-300">Inicio</Link>
            <Link to="/reports" className="hover:text-gray-300">Relatórios</Link>
            <Link to="/analytics" className="hover:text-gray-300">Análises</Link>
            <Link to="/goals" className="hover:text-gray-300">Objectivos financeiros</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
