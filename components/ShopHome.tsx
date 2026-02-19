
import React, { useState, useEffect } from 'react';
import { Search, Zap, Star, Plus, MapPin, Package, Tool } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState<'Tudo' | 'Produtos' | 'Serviços'>('Tudo');

  useEffect(() => {
    const fetchProducts = async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (activeCategory !== 'Tudo') {
        query = query.eq('category', activeCategory);
      }
      const { data, error } = await query;
      if (!error && data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory]);

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400";

  const ProductSkeleton = () => (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-50 flex flex-col h-60 overflow-hidden relative">
      <div className="bg-slate-100 rounded-xl mb-3 h-32 animate-pulse"></div>
      <div className="h-3 bg-slate-100 rounded-full w-3/4 mb-2 animate-pulse"></div>
      <div className="h-2 bg-slate-100 rounded-full w-1/2 animate-pulse"></div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-4 bg-slate-100 rounded-full w-12 animate-pulse"></div>
        <div className="w-8 h-8 bg-slate-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">CompraFácil</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
             <MapPin size={10} className="text-orange-600 fill-orange-600" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riacho dos Barreiros</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
          <Zap size={20} fill="currentColor" />
        </div>
      </div>

      {/* Categories Toggle */}
      <div className="flex gap-2 mb-8">
        {['Tudo', 'Produtos', 'Serviços'].map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat as any)}
            className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeCategory === cat ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-400 border border-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Trigger */}
      <div className="relative mb-8 cursor-pointer group" onClick={onOpenSearch}>
        <div className="absolute inset-0 bg-orange-500/10 blur-xl scale-95 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl text-slate-400 text-xs font-bold shadow-sm border border-slate-100 relative z-10 transition-all flex items-center">
          <Search className="absolute left-4 text-slate-300" size={18} />
          Busque no Riacho...
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-black text-slate-900">{activeCategory === 'Serviços' ? 'Serviços Locais' : 'Melhores Ofertas'}</h3>
        <button className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Ver Todos</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
           {[1, 2, 3, 4].map(n => <ProductSkeleton key={n} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-10">
          {products.map(product => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl p-3 shadow-sm border border-slate-50 relative group cursor-pointer hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 flex flex-col"
              onClick={() => onProductClick(product)}
            >
              <div className="bg-slate-50 rounded-xl p-2 mb-3 h-36 flex items-center justify-center relative overflow-hidden">
                <img 
                  src={product.image_urls?.[0] || PLACEHOLDER_IMAGE} 
                  alt={product.name} 
                  className="w-full h-full object-contain relative z-10 group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1 px-1">{product.name}</h4>
              <div className="flex items-center gap-1 mb-2 px-1">
                <Star className="text-amber-400 fill-amber-400" size={10} />
                <span className="text-[9px] font-black text-slate-400">{product.rating.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center mt-auto px-1">
                <p className="text-orange-600 font-black text-sm">R$ {product.price.toLocaleString('pt-BR')}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm active:scale-90"
                >
                  <Plus size={16} />
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
