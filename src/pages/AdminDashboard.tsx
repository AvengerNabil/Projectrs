import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Product, Order } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: 0,
    category: 'Men',
    stock: 0,
    image: '',
    rating: 4.5,
    sizes: [] as string[],
    colors: [] as string[]
  });

  // Helper to convert comma separated string to array
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setSizesInput(editingProduct.sizes?.join(', ') || '');
      setColorsInput(editingProduct.colors?.join(', ') || '');
    } else {
      setSizesInput('');
      setColorsInput('');
    }
  }, [editingProduct]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      
      const ordersSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="p-20 text-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalProduct = {
      ...productForm,
      sizes: sizesInput.split(',').map(s => s.trim()).filter(s => s !== ''),
      colors: colorsInput.split(',').map(c => c.trim()).filter(c => c !== '')
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), finalProduct);
      } else {
        await addDoc(collection(db, 'products'), {
          ...finalProduct,
          createdAt: new Date().toISOString()
        });
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ title: '', description: '', price: 0, category: 'Men', stock: 0, image: '', rating: 4.5, sizes: [], colors: [] });
      setSizesInput('');
      setColorsInput('');
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { orderStatus: status });
      fetchData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const seedProducts = async () => {
    if (products.length > 0) {
      if (!window.confirm('Products already exist. Seeding will add duplicates. Continue?')) return;
    }
    
    setLoading(true);
    const initialProducts = [
      {
        title: 'Premium White Tee',
        description: 'A versatile essential made from 100% organic cotton. Perfect for layering or wearing on its own.',
        price: 25.00,
        category: 'Men',
        stock: 50,
        image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['White', 'Black', 'Gray'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Summer Floral Dress',
        description: 'Lightweight and breathable dress with a beautiful floral print. Ideal for warm sunny days.',
        price: 59.00,
        category: 'Women',
        stock: 20,
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['Blue', 'Pink'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Baby Cotton Onesie',
        description: 'Ultra-soft cotton onesie for your little one. Features snap buttons for easy changes.',
        price: 18.00,
        category: 'Baby',
        stock: 30,
        image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        sizes: ['0-3M', '3-6M', '6-12M'],
        colors: ['White', 'Light Blue', 'Light Pink'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Vintage Denim Jacket',
        description: 'A timeless denim jacket with a modern fit. Durable and stylish for any season.',
        price: 89.00,
        category: 'Men',
        stock: 12,
        image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Blue', 'Dark Blue'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Slim Fit Chinos',
        description: 'Comfortable and stylish chinos made from high-quality stretch cotton. Ideal for both casual and formal wear.',
        price: 45.00,
        category: 'Men',
        stock: 25,
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        sizes: ['30', '32', '34', '36'],
        colors: ['Beige', 'Navy', 'Olive'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Oversized Wool Sweater',
        description: 'Cozy and warm oversized sweater knitted from premium merino wool. A must-have for chilly days.',
        price: 75.00,
        category: 'Women',
        stock: 15,
        image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        sizes: ['S', 'M', 'L'],
        colors: ['Cream', 'Camel', 'Gray'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Toddler Denim Overalls',
        description: 'Adorable and durable denim overalls for toddlers. Features adjustable straps and multiple pockets.',
        price: 32.00,
        category: 'Baby',
        stock: 18,
        image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        sizes: ['12-18M', '18-24M', '2T'],
        colors: ['Blue Denim'],
        createdAt: new Date().toISOString()
      },
      {
        title: 'Leather Chelsea Boots',
        description: 'Classic leather Chelsea boots with a sleek design and comfortable elastic side panels.',
        price: 120.00,
        category: 'Men',
        stock: 10,
        image: 'https://images.unsplash.com/photo-1542838686-37da4a9fd1b3?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        sizes: ['8', '9', '10', '11', '12'],
        colors: ['Black', 'Brown'],
        createdAt: new Date().toISOString()
      }
    ];

    try {
      for (const p of initialProducts) {
        await addDoc(collection(db, 'products'), p);
      }
      alert('Products seeded successfully!');
      fetchData();
    } catch (error) {
      console.error('Error seeding products:', error);
      alert('Failed to seed products.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2">Manage your store's products and orders</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Orders
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard data...</p>
        </div>
      ) : activeTab === 'products' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Products ({products.length})</h2>
              {products.length === 0 && (
                <button
                  onClick={seedProducts}
                  className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold hover:bg-indigo-100 transition-all"
                >
                  Seed Initial Products
                </button>
              )}
            </div>
            <button
              onClick={() => { setEditingProduct(null); setProductForm({ title: '', description: '', price: 0, category: 'Men', stock: 0, image: '', rating: 4.5, sizes: [], colors: [] }); setShowProductModal(true); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center transition-all shadow-lg shadow-indigo-100"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Product
            </button>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={product.image} alt={product.title} className="h-10 w-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                        <span className="font-bold text-gray-900 line-clamp-1">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${product.stock > 10 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => { setEditingProduct(product); setProductForm({ ...product }); setShowProductModal(true); }}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Orders ({orders.length})</h2>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className="text-sm font-bold bg-gray-50 border-none rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-indigo-600 font-bold text-sm hover:underline">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-12 relative">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Baby">Baby</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock</label>
                <input
                  type="number"
                  required
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sizes (comma separated)</label>
                <input
                  type="text"
                  placeholder="S, M, L, XL"
                  required
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Colors (comma separated)</label>
                <input
                  type="text"
                  placeholder="Red, Blue, Black"
                  required
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  required
                  value={productForm.rating}
                  onChange={(e) => setProductForm({ ...productForm, rating: parseFloat(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              
              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100"
                >
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
