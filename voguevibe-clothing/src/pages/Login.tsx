import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || "/";

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl text-center">
        <div>
          <div className="mx-auto h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <ShoppingBag className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
          <p className="mt-4 text-gray-500 text-lg">
            Sign in to your account to continue your shopping journey.
          </p>
        </div>
        
        <div className="mt-10">
          <button
            onClick={handleLogin}
            className="group relative w-full flex justify-center py-4 px-4 border border-gray-200 rounded-2xl text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-6">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-6 w-6" />
            </span>
            Sign in with Google
          </button>
        </div>
        
        <p className="mt-8 text-center text-sm text-gray-400">
          By signing in, you agree to our <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500">Terms of Service</a> and <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
