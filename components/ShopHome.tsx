
import React, { useState, useEffect } from 'react';
import { Search, Zap, Star, LayoutGrid, Heart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';

interface ShopHomeProps {
  onProductClick: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  onOpenSearch: () => void;
}

const ShopHome: React.FC<ShopHomeProps> = ({ onProductClick, onAddToCart, onOpenSearch }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = [
    { icon: '👟', name: 'Tênis' },
    { icon: '⌚', name: 'Relógios' },
    { icon: '🎧', name: 'Eletrônicos' },
    { icon: '👕', name: 'Roupas' },
  ];

  return (
    <div className="p-6 pt-10 animate-in fade-in duration-500 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CompraFácil</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sua Região • 100% Seguro</p>
        </div>
        <button className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
           <Heart size={22} />
        </button>
      </div>

      {/* Search Trigger */}
      <div className="relative mb-10 cursor-pointer group" onClick={onOpenSearch}>
        <div className="absolute inset-0 bg-indigo-100/50 blur-xl scale-95 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <div className="w-full pl-14 pr-6 py-4 bg-white rounded-[24px] text-slate-400 text-sm font-medium shadow-sm border border-slate-100 relative z-10">
          Procurar produtos...
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar gap-5">
        {categories.map((cat, i) => (
          <div key={i} className="flex flex-col items-center min-w-[70px] cursor-pointer group">
            <div className="w-16 h-16 rounded-[22px] bg-white shadow-sm flex items-center justify-center text-2xl mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
              {cat.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 group-hover:text-indigo-600">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          Destaques <Zap className="text-amber-500 fill-amber-500 animate-pulse" size={18} />
        </h3>
        <button className="text-indigo-600 font-black text-xs uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">Ver tudo</button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5">
           {[1,2,3,4].map(n => (
             <div key={n} className="h-64 bg-white rounded-[40px] animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-[40px] p-4 shadow-sm border border-white relative group cursor-pointer hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500"
              onClick={() => onProductClick(product)}
            >
              {product.original_price && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full z-10 shadow-lg shadow-rose-200">
                  -{Math.round((1 - product.price/product.original_price) * 100)}%
                </div>
              )}
              <div className="bg-slate-50 rounded-[32px] p-3 mb-4 h-36 flex items-center justify-center relative overflow-hidden group-hover:bg-white transition-colors">
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1 px-1">{product.name}</h4>
              <div className="flex items-center gap-1 mb-3 px-1">
                <Star className="text-amber-400 fill-amber-400" size={12} />
                <span className="text-[10px] font-black text-slate-400">{product.rating}</span>
              </div>
              <div className="flex justify-between items-end px-1">
                <div>
                  <p className="text-indigo-600 font-black text-base">R$ {product.price.toLocaleString('pt-BR')}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="w-10 h-10 rounded-[18px] bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:scale-110 active:scale-95 transition-all shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopHome;
