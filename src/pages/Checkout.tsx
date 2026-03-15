import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CreditCard, MapPin, Truck, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('visa');
  const [formData, setFormData] = useState({
    address: user?.address || '',
    city: '',
    zip: '',
    country: ''
  });

  if (!user) return <Navigate to="/login" state={{ from: { pathname: '/checkout' } }} />;
  if (cart.length === 0 && !orderComplete) return <Navigate to="/products" />;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const orderData = {
        userId: user.uid,
        products: cart,
        totalPrice: totalPrice,
        paymentMethod: selectedPayment,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zip}, ${formData.country}`,
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
          Thank you for your purchase. Your order has been placed successfully and is being processed.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate('/products')}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-2xl font-bold transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10">Checkout</h1>
      
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Shipping Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP / Postal Code</label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="10001"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
            </div>
            
            <div className="space-y-4">
              {/* Visa */}
              <div 
                onClick={() => setSelectedPayment('visa')}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedPayment === 'visa' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Visa Card</p>
                    <p className="text-sm text-gray-500">Pay securely with your Visa</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full border-4 ${selectedPayment === 'visa' ? 'border-indigo-600 bg-white' : 'border-gray-200'}`}></div>
              </div>

              {/* bKash */}
              <div 
                onClick={() => setSelectedPayment('bkash')}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedPayment === 'bkash' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Bkash_logo.svg/1200px-Bkash_logo.svg.png" alt="bKash" className="h-6" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">bKash</p>
                    <p className="text-sm text-gray-500">Pay via bKash mobile wallet</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full border-4 ${selectedPayment === 'bkash' ? 'border-indigo-600 bg-white' : 'border-gray-200'}`}></div>
              </div>

              {/* Nagad */}
              <div 
                onClick={() => setSelectedPayment('nagad')}
                className={`p-6 border-2 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${selectedPayment === 'nagad' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100 hover:border-indigo-200'}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nagad_logo.svg/1200px-Nagad_logo.svg.png" alt="Nagad" className="h-6" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Nagad</p>
                    <p className="text-sm text-gray-500">Pay via Nagad mobile wallet</p>
                  </div>
                </div>
                <div className={`h-6 w-6 rounded-full border-4 ${selectedPayment === 'nagad' ? 'border-indigo-600 bg-white' : 'border-gray-200'}`}></div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
              <p className="text-sm text-gray-500">
                Your payment information is encrypted and processed securely.
              </p>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 sticky top-24">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400">x{item.quantity}</span>
                    <span className="text-sm font-medium text-gray-700 line-clamp-1">{item.title}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-4 mb-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-indigo-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-center flex items-center justify-center transition-all shadow-xl shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>Place Order & Pay</>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
              <Truck className="h-4 w-4" />
              <span className="text-xs font-medium">Estimated delivery: 3-5 business days</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
