import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Facebook, Twitter, Instagram, Github, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900 uppercase">VogueVibe</span>
            </Link>
            <p className="text-gray-500 leading-relaxed">
              Premium fashion for Men, Women, and Baby. Elevate your style with our curated collections.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-gray-500 hover:text-indigo-600 transition-colors">All Collections</Link></li>
              <li><Link to="/products?category=Men" className="text-gray-500 hover:text-indigo-600 transition-colors">Men's Fashion</Link></li>
              <li><Link to="/products?category=Women" className="text-gray-500 hover:text-indigo-600 transition-colors">Women's Fashion</Link></li>
              <li><Link to="/products?category=Baby" className="text-gray-500 hover:text-indigo-600 transition-colors">Baby & Kids</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Support</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Returns & Refunds</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-8">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-indigo-600 mt-0.5" />
                <span className="text-gray-500">Mirpur 10, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-500">01748146625 (WhatsApp)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-500">smnabilausaf@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} VogueVibe Clothing. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Bkash_logo.svg/1200px-Bkash_logo.svg.png" alt="bKash" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_logo.svg/1200px-Nagad_logo.svg.png" alt="Nagad" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </footer>
  );
};
