import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const activeLinkStyle = {
    color: '#3b82f6', // blue-500
    borderBottom: '2px solid #3b82f6',
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <NavLink
          to="/"
          className="flex items-center gap-3 text-xl font-bold text-blue-600 no-underline"
        >
          <img
            src="/logo.png"   // ✅ public folder path (NO /public here)
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          WATER QUALITY PREDICTION
        </NavLink>

        <div className="hidden md:flex items-center space-x-6">
          <NavLink
            to="/"
            className="text-gray-600 hover:text-blue-500 pb-1"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/prediction"
                className="text-gray-600 hover:text-blue-500 pb-1"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Prediction
              </NavLink>

              <NavLink
                to="/portfolio"
                className="text-gray-600 hover:text-blue-500 pb-1"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Portfolio
              </NavLink>

              <NavLink
                to="/about"
                className="text-gray-600 hover:text-blue-500 pb-1"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                About
              </NavLink>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/about"
                className="text-gray-600 hover:text-blue-500 pb-1"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                About
              </NavLink>

              <NavLink
                to="/signup"
                className="text-gray-600 hover:text-blue-500 pb-1"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                Signup
              </NavLink>

              <NavLink
                to="/login"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 rounded-md"
              >
                Login
              </NavLink>
            </>
          )}
        </div>
        {/* TODO: Mobile menu for small screens */}
      </div>
    </nav>
  );
};

export default Navbar;
