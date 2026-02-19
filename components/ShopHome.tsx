
import React, { useState, useEffect } from 'react';
import { Search, Zap, Star, Plus } from 'lucide-react';
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
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = [
    { icon: '👟', name: 'Tênis' },
    { icon: '⌚', name: 'Relógios' },
    { icon: '🎧', name: 'Fones' },
    { icon: '👕', name: 'Roupas' },
  ];

  return (
    <div className="p-6 pt-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CompraFácil</h1>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sua Região • Online</p>
          </div>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="relative mb-10 cursor-pointer group" onClick={onOpenSearch}>
        <div className="absolute inset-0 bg-indigo-500/10 blur-2xl scale-95 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-full pl-14 pr-6 py-4.5 bg-white rounded-3xl text-slate-400 text-sm font-bold shadow-sm border border-slate-100 relative z-10 transition-all flex items-center">
          <Search className="absolute left-5 text-slate-300" size={20} />
          Encontre o que deseja...
        </div>
      </div>

      {/* Categories */}
      <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar gap-5">
        {categories.map((cat, i) => (
          <div key={i} className="flex flex-col items-center min-w-[75px] cursor-pointer group">
            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm border border-transparent flex items-center justify-center text-2xl mb-3 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
              {cat.icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-indigo-500">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          Destaques <Zap className="text-amber-500 fill-amber-500" size={18} />
        </h3>
        <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">Explorar tudo</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5">
           {[1,2,3,4].map(n => (
             <div key={n} className="h-64 bg-white rounded-5xl animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 mb-10">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-5xl p-4 shadow-sm border border-transparent relative group cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col"
              onClick={() => onProductClick(product)}
            >
              {product.original_price && (
                <div className="absolute top-4 left-4 bg-rose-500 text-white text-[9px] font-black px-2.5 py-1.5 rounded-2xl z-20 shadow-lg shadow-rose-200">
                  SALE
                </div>
              )}
              <div className="bg-slate-50 rounded-4xl p-3 mb-4 h-40 flex items-center justify-center relative overflow-hidden transition-colors">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
              <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 mb-1 px-1">{product.name}</h4>
              <div className="flex items-center gap-1 mb-3 px-1">
                <Star className="text-amber-400 fill-amber-400" size={10} />
                <span className="text-[10px] font-black text-slate-400">5.0</span>
              </div>
              <div className="flex justify-between items-center mt-auto px-1">
                <p className="text-indigo-600 font-black text-base">R$ {product.price.toLocaleString('pt-BR')}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <Plus size={20} />
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
