// components/Header.tsx
import React from 'react';
import { Search, Menu, Bell, User } from 'lucide-react';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center">
              <img
                src="https://img.freepik.com/free-vector/owl-gradient-design-logo-illustration_343694-1565.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Google"
                className="w-10 h-10 mr-2 rounded-full"
              />
              <span className="text-xl font-bold">Job Listing</span>
            </div>
            <nav className="hidden md:flex ml-10 space-x-8">
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">About Company</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Careers</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Feature</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">Contact us</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Menu className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button
                  onClick={logout}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* You can link to /login and /signup pages, or open modals */}
                <a href="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;