
import React from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Zap, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart, onBuyNow }) => {
  return (
    <div className="animate-in slide-in-from-right duration-500 min-h-screen bg-slate-50 transition-colors">
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 p-6 flex justify-between items-center bg-transparent pointer-events-none">
        <button onClick={onBack} className="w-12 h-12 glass rounded-2xl shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition-all pointer-events-auto">
          <ArrowLeft size={22} />
        </button>
        <div className="flex gap-3 pointer-events-auto">
          <button className="w-12 h-12 glass rounded-2xl shadow-lg flex items-center justify-center text-slate-400 active:scale-90 transition-all">
            <Share2 size={20} />
          </button>
          <button className="w-12 h-12 glass rounded-2xl shadow-lg flex items-center justify-center text-rose-500 active:scale-90 transition-all">
            <Heart size={22} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-[60px] pt-28 pb-16 px-10 shadow-sm transition-colors">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-5xl rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000"></div>
          <img src={product.image_url} alt={product.name} className="w-full h-80 object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>

      <div className="px-8 py-10 pb-40">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full inline-block">
                {product.category}
              </span>
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                <Star className="text-amber-500 fill-amber-500" size={12} />
                <span className="text-[10px] font-black text-amber-900">{product.rating}</span>
              </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
          </div>
        </div>

        <div className="flex items-baseline gap-4 mb-10">
           <span className="text-4xl font-black text-indigo-600">R$ {product.price.toLocaleString('pt-BR')}</span>
           {product.original_price && <span className="text-slate-300 line-through text-lg font-bold">R$ {product.original_price}</span>}
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Informações Gerais</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {product.description || "Incrível produto disponível em sua região com pronta entrega e garantia de qualidade premium."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-colors">
              <p className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-widest">Entrega</p>
              <p className="text-xs font-black text-slate-800">Em 24 Horas</p>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm transition-colors">
              <p className="text-[9px] font-black text-slate-300 uppercase mb-1 tracking-widest">Condição</p>
              <p className="text-xs font-black text-slate-800">Novo e Lacrado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-8 glass border-t border-slate-100 flex gap-4 z-40">
        <button 
          onClick={() => onAddToCart(product)}
          className="w-16 h-16 bg-slate-100 text-slate-800 rounded-3xl flex items-center justify-center transition-all active:scale-90"
        >
          <ShoppingCart size={24} />
        </button>
        <button 
          onClick={() => onBuyNow(product)}
          className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-3xl shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all"
        >
          <Zap size={20} className="fill-white" />
          Comprar Já
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
