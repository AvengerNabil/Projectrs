import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, MapPin, Calendar, Shield, LogOut, Package } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 h-32 relative">
          <div className="absolute -bottom-12 left-10">
            <div className="h-24 w-24 bg-white rounded-3xl p-1 shadow-lg">
              <div className="h-full w-full bg-indigo-50 rounded-[1.25rem] flex items-center justify-center">
                <UserIcon className="h-12 w-12 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-10 px-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-500 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" /> {user.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/orders"
                className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-indigo-100 transition-colors"
              >
                <Package className="h-5 w-5 mr-2" /> My Orders
              </Link>
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-2" /> Logout
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Shield className="h-5 w-5 mr-3 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3 text-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Shipping Address</h3>
              <div className="flex items-start text-gray-600">
                <MapPin className="h-5 w-5 mr-3 text-indigo-400 mt-1" />
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Default Address</p>
                  <p className="font-medium leading-relaxed">
                    {user.address || 'No address saved yet. Add one during your next checkout.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
