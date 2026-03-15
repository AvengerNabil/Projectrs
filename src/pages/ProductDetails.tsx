import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, ArrowLeft, Truck, ShieldCheck, RotateCcw, Loader2 } from 'lucide-react';

const getRelatedProducts = (currentProductId: string, category: string): Product[] => {
  const allProducts = [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
      id: '4',
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
      id: '5',
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
      id: '6',
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
      id: '7',
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
      id: '8',
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

  // Return 4 related products from the same category, excluding the current product
  return allProducts
    .filter(p => p.id !== currentProductId && p.category === category)
    .slice(0, 4);
};

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Mock data fallback for development
  const getMockProduct = (productId: string): Product | null => {
    const mockProducts = [
      {
        id: '1',
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
        id: '2',
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
        id: '3',
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
        id: '4',
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
        id: '5',
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
        id: '6',
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
        id: '7',
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
        id: '8',
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
    return mockProducts.find(p => p.id === productId) || null;
  };

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
          // Try to get from mock data
          const mockProduct = getMockProduct(id);
          if (mockProduct) {
            setProduct(mockProduct);
            if (mockProduct.sizes && mockProduct.sizes.length > 0) setSelectedSize(mockProduct.sizes[0]);
            if (mockProduct.colors && mockProduct.colors.length > 0) setSelectedColor(mockProduct.colors[0]);
          } else {
            console.error('Product not found');
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Try to get from mock data on error
        const mockProduct = getMockProduct(id);
        if (mockProduct) {
          setProduct(mockProduct);
          if (mockProduct.sizes && mockProduct.sizes.length > 0) setSelectedSize(mockProduct.sizes[0]);
          if (mockProduct.colors && mockProduct.colors.length > 0) setSelectedColor(mockProduct.colors[0]);
        }
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
          
          {/* Quantity Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Quantity</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:border-indigo-600 transition-colors"
              >
                <span className="text-xl font-bold text-gray-600">-</span>
              </button>
              <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center hover:border-indigo-600 transition-colors"
              >
                <span className="text-xl font-bold text-gray-600">+</span>
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product, selectedSize, selectedColor);
                  }
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                }}
                disabled={product.stock <= 0}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all shadow-xl shadow-indigo-100 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="mr-2 h-6 w-6" /> Add to Cart
              </button>
              <button 
                onClick={() => {
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product, selectedSize, selectedColor);
                  }
                  setShowSuccess(true);
                  setTimeout(() => setShowSuccess(false), 3000);
                  setTimeout(() => navigate('/cart'), 500);
                }}
                disabled={product.stock <= 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-lg flex items-center justify-center transition-all shadow-xl shadow-indigo-100 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
            
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center space-x-3">
                <div className="bg-green-500 rounded-full p-1">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 font-medium">Added to cart successfully!</p>
                  <p className="text-green-600 text-sm">Continue shopping or proceed to checkout.</p>
                </div>
              </div>
            )}
            
            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Price ({quantity} item{quantity > 1 ? 's' : ''})</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            </div>
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

      {/* Related Products */}
      <div className="mt-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {getRelatedProducts(product.id, product.category).map((relatedProduct) => (
            <div key={relatedProduct.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <Link to={`/products/${relatedProduct.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                    {relatedProduct.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {relatedProduct.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-gray-900">${relatedProduct.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-600 ml-1">{relatedProduct.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
