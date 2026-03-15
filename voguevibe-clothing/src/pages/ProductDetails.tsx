import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ArrowLeft, Truck, ShieldCheck, RotateCcw, Loader2 } from 'lucide-react';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as Product;
          setProduct({ id: docSnap.id, ...data });
          if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
          if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        } else {
          console.error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h2>
        <Link to="/products" className="text-indigo-600 font-bold hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Product Image */}
        <div className="bg-gray-50 rounded-[2.5rem] overflow-hidden aspect-square border border-gray-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/800/800';
            }}
          />
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 leading-tight">
              {product.title}
            </h1>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-sm font-bold text-indigo-900">{product.rating}</span>
              </div>
              <span className="text-gray-400 text-sm">|</span>
              <span className="text-gray-500 text-sm">120+ Reviews</span>
              <span className="text-gray-400 text-sm">|</span>
              <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
          
          <div className="mb-8">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          </div>
          
          <div className="mb-10 text-gray-600 leading-relaxed text-lg">
            <p>{product.description}</p>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Select Size</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[3rem] h-12 px-4 rounded-xl font-bold text-sm transition-all border ${
                      selectedSize === size
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-600'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-10">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Select Color</h3>
              <div className="flex flex-wrap gap-4">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                      selectedColor === color ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                    }`}
                    title={color}
                  >
                    <span 
                      className="w-full h-full rounded-full border border-gray-200" 
                      style={{ backgroundColor: color.toLowerCase() }}
                    ></span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button
              onClick={() => addToCart(product, selectedSize, selectedColor)}
              disabled={product.stock <= 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all shadow-xl shadow-indigo-100"
            >
              <ShoppingCart className="mr-2 h-6 w-6" /> Add to Cart
            </button>
            <button className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg transition-all">
              Buy Now
            </button>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Free Delivery</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">1 Year Warranty</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">30 Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
