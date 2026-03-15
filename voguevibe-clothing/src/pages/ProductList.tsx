import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Loader2 } from 'lucide-react';

export const ProductList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [categories, setCategories] = useState<string[]>(['All', 'Men', 'Women', 'Baby']);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(productsData);
      
      // Ensure we have the basic categories even if no products exist yet
      const uniqueCategories = ['All', ...new Set(productsData.map(p => p.category))];
      // Merge with our predefined ones to be safe
      const finalCategories = Array.from(new Set([...uniqueCategories, 'Men', 'Women', 'Baby']));
      setCategories(finalCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const seedProducts = async () => {
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
      fetchProducts();
    } catch (error) {
      console.error('Error seeding products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">VogueVibe Collections</h1>
          <p className="text-gray-500 mt-2">Discover the latest trends in Men's, Women's, and Baby fashion.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="appearance-none w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">
            {products.length === 0 
              ? "The store is currently empty. Please add some products to get started." 
              : "Try adjusting your search or filters to find what you're looking for."}
          </p>
          
          <div className="flex flex-col items-center space-y-4 mt-8">
            {(searchTerm !== '' || selectedCategory !== 'All') && (
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                className="text-indigo-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            )}
            
            {products.length === 0 && isAdmin && (
              <button
                onClick={seedProducts}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                Seed Initial Products
              </button>
            )}
            
            <Link
              to="/"
              className="text-gray-500 hover:text-indigo-600 font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
