import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, Search, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600 tracking-tighter">
              VOGUE<span className="text-gray-900">VIBE</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-10">
            <Link to="/products?category=Men" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              Men
            </Link>
            <Link to="/products?category=Women" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              Women
            </Link>
            <Link to="/products?category=Baby" className="text-gray-600 hover:text-indigo-600 font-medium text-sm transition-colors">
              Baby
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all"
                placeholder="Search products..."
              />
            </div>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors" title="Admin Dashboard">
                    <LayoutDashboard className="h-6 w-6" />
                  </Link>
                )}
                <Link to="/profile" className="text-gray-600 hover:text-indigo-600 transition-colors" title="Profile">
                  <UserIcon className="h-6 w-6" />
                </Link>
                <button onClick={logout} className="text-gray-600 hover:text-red-600 transition-colors" title="Logout">
                  <LogOut className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                <UserIcon className="h-6 w-6" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
              placeholder="Search products..."
            />
          </div>
          <div className="flex flex-col space-y-4">
            <Link to="/products?category=Men" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Men</Link>
            <Link to="/products?category=Women" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Women</Link>
            <Link to="/products?category=Baby" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Baby</Link>
            <Link to="/cart" className="text-gray-600 font-medium flex items-center" onClick={() => setIsMenuOpen(false)}>
              Cart {totalItems > 0 && <span className="ml-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{totalItems}</span>}
            </Link>
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>}
                <Link to="/profile" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" className="text-gray-600 font-medium" onClick={() => setIsMenuOpen(false)}>Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
