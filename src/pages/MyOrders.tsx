import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';

export const MyOrders: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (authLoading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold text-gray-900">My Orders</h1>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl">
          <span className="text-indigo-600 font-bold">{orders.length} Orders</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-50 p-3 rounded-2xl">
                      <Package className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                      <p className="font-mono text-sm text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl">
                      {getStatusIcon(order.orderStatus)}
                      <span className="text-sm font-bold capitalize text-gray-700">{order.orderStatus}</span>
                    </div>
                    <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                      ${order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Products</p>
                    <div className="space-y-3">
                      {order.products.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          <img src={item.image} alt={item.title} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Details</p>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-sm text-gray-600 leading-relaxed">{order.shippingAddress}</p>
                      <p className="text-xs text-gray-400 mt-3">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-8 py-4 flex justify-end">
                <button className="text-indigo-600 font-bold text-sm flex items-center hover:underline">
                  View Order Details <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping and find something special!
          </p>
          <Link
            to="/products"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold transition-all"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
};
