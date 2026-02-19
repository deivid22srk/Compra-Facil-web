
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Zap, Share2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';
import { supabase } from '../supabaseClient';

interface ProductDetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack, onAddToCart, onBuyNow }) => {
  const [activeImage, setActiveImage] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
      if (data) setReviews(data);
      setLoadingReviews(false);
    };
    fetchReviews();
  }, [product.id]);

  const images = product.image_urls?.length > 0 ? product.image_urls : ["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400"];

  return (
    <div className="animate-in slide-in-from-right duration-500 min-h-screen bg-slate-50 pb-40">
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 p-6 flex justify-between items-center bg-transparent pointer-events-none">
        <button onClick={onBack} className="w-10 h-10 glass rounded-xl shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition-all pointer-events-auto">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button className="w-10 h-10 glass rounded-xl shadow-lg flex items-center justify-center text-rose-500 active:scale-90 transition-all">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-b-[32px] pt-24 pb-12 px-10 shadow-sm relative overflow-hidden">
        <div className="relative aspect-square">
          <div className="absolute inset-0 bg-orange-500/5 blur-3xl rounded-full scale-90"></div>
          <img src={images[activeImage]} alt={product.name} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
        </div>
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-6 relative z-20">
            {images.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${activeImage === idx ? 'w-4 bg-orange-600' : 'bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="text-amber-500 fill-amber-500" size={12} />
              <span className="text-[10px] font-black text-amber-900">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
        </div>

        <div className="flex items-baseline gap-4 mb-8">
           <span className="text-3xl font-black text-orange-600">R$ {product.price.toLocaleString('pt-BR')}</span>
        </div>

        <div className="space-y-6 mb-12">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Sobre</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {product.description || "Disponível para entrega imediata no Sítio Riacho dos Barreiros."}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedbacks do Riacho</h3>
            <span className="text-[10px] font-bold text-slate-300">{reviews.length} Avaliações</span>
          </div>

          <div className="space-y-4">
            {loadingReviews ? (
              <p className="text-[10px] text-center text-slate-300 font-bold uppercase py-4">Carregando opiniões...</p>
            ) : reviews.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                <MessageSquare size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400 font-black uppercase">Ainda sem avaliações locais.</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-slate-800 uppercase">{rev.user_email.split('@')[0]}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={8} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 glass border-t border-slate-100 flex gap-3 z-40">
        <button onClick={() => onAddToCart(product)} className="w-14 h-14 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center transition-all active:scale-90">
          <ShoppingCart size={22} />
        </button>
        <button onClick={() => onBuyNow(product)} className="flex-1 bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all text-sm">
          <Zap size={18} className="fill-white" />
          Comprar Agora
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
