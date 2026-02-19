
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Star, Heart, ShoppingCart, Zap, Share2, MessageSquare, X, Maximize2 } from 'lucide-react';
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
  const [showLightbox, setShowLightbox] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
      if (data) setReviews(data);
      setLoadingReviews(false);
    };
    fetchReviews();
  }, [product.id]);

  const images = product.image_urls?.length > 0 ? product.image_urls : ["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400"];

  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(scrollRef.current.scrollLeft / scrollRef.current.offsetWidth);
      setActiveImage(index);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Confira este produto no Riacho: ${product.name} por apenas R$ ${product.price.toLocaleString('pt-BR')}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      alert('Copiado para a área de transferência!');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="animate-in slide-in-from-right duration-500 min-h-screen bg-white pb-40 relative">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-50 p-6 flex justify-between items-center pointer-events-none">
        <button onClick={onBack} className="w-10 h-10 glass rounded-xl shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition-all pointer-events-auto border border-white/50">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={handleShare} className="w-10 h-10 glass rounded-xl shadow-lg flex items-center justify-center text-slate-800 active:scale-90 transition-all border border-white/50">
            <Share2 size={18} />
          </button>
          <button className="w-10 h-10 glass rounded-xl shadow-lg flex items-center justify-center text-rose-500 active:scale-90 transition-all border border-white/50">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Swipeable Gallery */}
      <div className="relative bg-slate-50 overflow-hidden">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-[400px]"
        >
          {images.map((img, idx) => (
            <div 
              key={idx} 
              className="min-w-full h-full snap-center flex items-center justify-center p-12 cursor-zoom-in"
              onClick={() => setShowLightbox(true)}
            >
              <img src={img} alt={`${product.name} ${idx}`} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
            </div>
          ))}
        </div>
        
        {/* Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? 'w-6 bg-orange-600' : 'w-1.5 bg-slate-300'}`}
              />
            ))}
          </div>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full glass flex items-center justify-center text-slate-400 pointer-events-none">
          <Maximize2 size={14} />
        </div>
      </div>

      <div className="px-8 pt-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-lg">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star className="text-amber-500 fill-amber-500" size={12} />
              <span className="text-[10px] font-black text-amber-900">{product.rating.toFixed(1)}</span>
            </div>
            {isOutOfStock && (
               <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-lg">
                Esgotado
             </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{product.name}</h1>
        </div>

        <div className="flex items-baseline gap-4 mb-8">
           <span className="text-3xl font-black text-orange-600">R$ {product.price.toLocaleString('pt-BR')}</span>
           <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
             {isOutOfStock ? 'Sem estoque' : `${product.stock_quantity} unidades disponíveis`}
           </span>
        </div>

        <div className="space-y-6 mb-12">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Descrição</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {product.description || "Este item está disponível para retirada rápida ou entrega no Sítio Riacho dos Barreiros. Qualidade garantida pela nossa curadoria local."}
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Opiniões do Riacho</h3>
            <span className="text-[10px] font-bold text-slate-300">{reviews.length} Feedbacks</span>
          </div>

          <div className="space-y-4">
            {loadingReviews ? (
              <p className="text-[10px] text-center text-slate-300 font-bold uppercase py-4">Carregando...</p>
            ) : reviews.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-3xl text-center border-2 border-dashed border-slate-100">
                <MessageSquare size={20} className="text-slate-200 mx-auto mb-2" />
                <p className="text-[10px] text-slate-400 font-black uppercase">Seja o primeiro a avaliar!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] font-black text-slate-800 uppercase">{rev.user_email.split('@')[0]}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={8} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug font-medium italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-6 glass border-t border-slate-100 flex gap-3 z-40">
        <button 
          onClick={() => !isOutOfStock && onAddToCart(product)} 
          disabled={isOutOfStock}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${isOutOfStock ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
        >
          <ShoppingCart size={22} />
        </button>
        <button 
          onClick={() => !isOutOfStock && onBuyNow(product)} 
          disabled={isOutOfStock}
          className={`flex-1 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95 transition-all text-xs ${isOutOfStock ? 'bg-slate-200 text-slate-400' : 'bg-orange-600 text-white shadow-orange-500/20'}`}
        >
          <Zap size={18} className={isOutOfStock ? 'hidden' : 'fill-white'} />
          {isOutOfStock ? 'Item Esgotado' : 'Comprar Agora'}
        </button>
      </div>

      {/* Lightbox / Zoom Modal */}
      {showLightbox && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-6 left-0 right-0 px-6 flex justify-between items-center">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">
              {activeImage + 1} / {images.length}
            </span>
            <button 
              onClick={() => { setShowLightbox(false); setZoomLevel(1); }}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          <div 
            className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
            onDoubleClick={() => setZoomLevel(zoomLevel === 1 ? 2.5 : 1)}
          >
            <img 
              src={images[activeImage]} 
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-300 ease-out"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          <div className="absolute bottom-10 flex gap-4">
             <button 
                onClick={() => setZoomLevel(Math.max(1, zoomLevel - 0.5))}
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white text-xl font-bold"
             >-</button>
             <button 
                onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white text-xl font-bold"
             >+</button>
          </div>
          
          <p className="absolute bottom-24 text-white/30 text-[8px] font-black uppercase tracking-widest">Toque duas vezes para zoom rápido</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
