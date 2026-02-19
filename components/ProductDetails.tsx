
import React from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart, onBuyNow }) => {
  return (
    <div className="animate-in slide-in-from-right duration-500 min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 p-4 flex justify-between items-center bg-white/10 backdrop-blur-md">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <button className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-rose-500 active:scale-90 transition-transform">
          <Heart size={22} />
        </button>
      </div>

      {/* Hero Image Section */}
      <div className="bg-white rounded-b-[60px] pt-24 pb-12 px-8 shadow-sm">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700"></div>
          <img src={product.image_url} alt={product.name} className="w-full h-72 object-contain relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-3 inline-block">
              {product.category}
            </span>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{product.name}</h1>
          </div>
          <div className="bg-amber-50 px-3 py-2 rounded-2xl flex items-center gap-1.5 shadow-sm border border-amber-100">
            <Star className="text-amber-500 fill-amber-500" size={18} />
            <span className="text-sm font-black text-amber-900">{product.rating}</span>
          </div>
        </div>

        <div className="flex items-baseline gap-3 mb-8">
           <span className="text-3xl font-black text-indigo-600">R$ {product.price.toLocaleString('pt-BR')}</span>
           {product.original_price && <span className="text-slate-300 line-through text-lg">R$ {product.original_price}</span>}
        </div>

        <div className="space-y-6 mb-32">
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-2">Descrição</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {product.description || "Este produto premium oferece qualidade superior e design moderno, ideal para quem busca o melhor custo-benefício do mercado local."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Pagamento</p>
              <p className="text-xs font-black text-slate-800">Na Entrega</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Garantia</p>
              <p className="text-xs font-black text-slate-800">Local</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-4">
        <button 
          onClick={() => onAddToCart(product)}
          className="flex-1 bg-slate-100 text-slate-800 font-black py-4 rounded-[24px] flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all"
        >
          <ShoppingCart size={20} />
          Carrinho
        </button>
        <button 
          onClick={() => onBuyNow(product)}
          className="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-[24px] shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 uppercase tracking-widest active:scale-95 transition-all"
        >
          <Zap size={20} className="fill-white" />
          Comprar Agora
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
