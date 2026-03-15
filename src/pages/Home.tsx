import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck, RotateCcw, MapPin, Phone, Mail } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

// Mock data for initial design
const FEATURED_PRODUCTS: Product[] = [
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

export const Home: React.FC = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[800px] flex items-center overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80"
            alt="Fashion Hero"
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <span className="text-indigo-400 font-bold text-sm uppercase tracking-[0.3em] mb-4 block">New Collection 2026</span>
            <motion.h1 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl md:text-8xl font-bold text-white leading-tight mb-8 tracking-tighter"
            >
              Define Your <span className="italic font-serif text-indigo-400">Style</span>
            </motion.h1>
            <p className="text-xl text-gray-200 mb-12 leading-relaxed max-w-lg">
              Explore our latest arrivals for Men, Women, and Baby. Quality fabrics and timeless designs for the modern family.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/products"
                  className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center transition-all shadow-2xl"
                >
                  Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </motion.div>
              <div className="flex items-center space-x-4">
                <Link to="/products?category=Men" className="text-white font-bold hover:text-indigo-400 transition-colors">Men</Link>
                <span className="text-white/30">/</span>
                <Link to="/products?category=Women" className="text-white font-bold hover:text-indigo-400 transition-colors">Women</Link>
                <span className="text-white/30">/</span>
                <Link to="/products?category=Baby" className="text-white font-bold hover:text-indigo-400 transition-colors">Baby</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
            { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '30-day money back' },
            { icon: ShoppingBag, title: 'Quality Goods', desc: 'Handpicked selection' }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="bg-indigo-50 p-3 rounded-xl">
                <feature.icon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Collections</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Men', image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=800&q=80', link: '/products?category=Men' },
            { name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80', link: '/products?category=Women' },
            { name: 'Baby', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80', link: '/products?category=Baby' }
          ].map((cat) => (
            <motion.div
              key={cat.name}
              whileHover={{ y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link 
                to={cat.link}
                className="group relative h-[400px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all block"
              >
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                  <h3 className="text-3xl font-bold text-white mb-2">{cat.name}</h3>
                  <p className="text-white/80 font-medium flex items-center group-hover:translate-x-2 transition-transform">
                    Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-indigo-600 font-bold text-sm uppercase tracking-widest">Our Selection</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Featured Products</h2>
          </div>
          <Link to="/products" className="text-indigo-600 font-bold hover:underline flex items-center">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURED_PRODUCTS.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[2rem] p-10 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-600 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400 rounded-full opacity-10 blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-indigo-400 font-bold text-sm uppercase tracking-widest mb-4 block">The Insider Club</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Get 15% Off Your First Fashion Order</h2>
            <p className="text-gray-400 text-lg mb-10">
              Join our community of style enthusiasts. Receive early access to new collections, exclusive styling tips, and members-only offers.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-900/20">
                Join Now
              </button>
            </form>
          </div>
        </div>
      </section>
      {/* Style & Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 text-white">
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80" 
              alt="Fashion Philosophy" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 md:p-24">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-indigo-400 font-bold text-sm uppercase tracking-widest block mb-4">Our Philosophy</span>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">Crafting Elegance, Defining Trends</h2>
              <p className="text-gray-300 text-xl leading-relaxed mb-10">
                We believe that fashion is more than just clothing—it's an expression of your unique identity. 
                Our collections are curated with a focus on timeless quality, sustainable materials, and 
                modern silhouettes that empower you to feel your best every day.
              </p>
              <div className="flex flex-wrap gap-8">
                <div>
                  <h4 className="text-3xl font-bold text-white">100%</h4>
                  <p className="text-indigo-400 text-sm uppercase tracking-wider">Organic Cotton</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white">24/7</h4>
                  <p className="text-indigo-400 text-sm uppercase tracking-wider">Style Support</p>
                </div>
                <div>
                  <h4 className="text-3xl font-bold text-white">Free</h4>
                  <p className="text-indigo-400 text-sm uppercase tracking-wider">Global Shipping</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 border border-white/20 rounded-[2rem] animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80" 
                  alt="Style Showcase" 
                  className="rounded-[2rem] shadow-2xl relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
