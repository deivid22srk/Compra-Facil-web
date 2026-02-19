
import React, { useEffect, useState, useRef } from 'react';
import { User as UserIcon, Package, LogOut, Loader2, Smartphone, ChevronRight, Camera, Star, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Order, Review } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileViewProps {
  user: SupabaseUser | null;
  onBack: () => void;
  onAuthClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack, onAuthClick }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (data) setOrders(data);
        setLoading(false);
      };
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUpdatingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      await supabase.auth.updateUser({ data: { avatar_url: base64data } });
      setUpdatingPhoto(false);
      window.location.reload();
    };
    reader.readAsDataURL(file);
  };

  const submitReview = async () => {
    if (!reviewOrder || !user) return;
    setSubmittingReview(true);
    
    const productName = reviewOrder.product_names.split(',')[0].replace(/^\d+x /, '');
    const { data: prodData } = await supabase.from('products').select('id').ilike('name', `%${productName}%`).limit(1);

    if (prodData && prodData[0]) {
      const { error } = await supabase.from('reviews').insert({
        product_id: prodData[0].id,
        user_id: user.id,
        user_email: user.email,
        rating: reviewRating,
        comment: reviewComment
      });

      if (!error) {
        alert('Obrigado pelo seu feedback local!');
        setReviewOrder(null);
        setReviewComment('');
      } else {
        alert('Erro ao enviar: ' + error.message);
      }
    }
    setSubmittingReview(false);
  };

  const userAvatar = user?.user_metadata?.avatar_url;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-8 border border-slate-100">
          <UserIcon size={32} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Riacho dos Barreiros</h2>
        <p className="text-slate-500 text-xs mb-10 px-8 leading-relaxed">Faça login para gerenciar suas compras exclusivas na região.</p>
        <button 
          onClick={onAuthClick} 
          className="w-full bg-orange-600 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-orange-500/10 uppercase tracking-widest text-xs active:scale-95 transition-all"
        >
          Entrar agora
        </button>
        <button 
          onClick={onBack} 
          className="mt-6 text-[10px] font-black text-slate-300 uppercase tracking-widest"
        >
          Voltar para a Loja
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 transition-colors animate-in fade-in duration-500">
      <div className="bg-orange-600 p-8 pt-12 rounded-b-[40px] text-white shadow-2xl shadow-orange-500/20">
        <div className="flex items-center gap-5 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center overflow-hidden border border-white/20 shadow-lg">
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" /> : <UserIcon size={28} className="text-white/60" />}
              {updatingPhoto && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 size={16} className="animate-spin" /></div>}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-orange-600 rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform"><Camera size={12} /></button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black truncate tracking-tight">{user.email?.split('@')[0]}</h2>
            <div className="flex items-center gap-1 mt-0.5 opacity-70">
              <Smartphone size={10} />
              <p className="text-[9px] font-black uppercase tracking-widest">Morador do Riacho</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-3 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 active:scale-90 transition-all"><LogOut size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] text-white/50 font-black uppercase mb-1 tracking-widest">Pedidos</p>
            <p className="text-lg font-black">{orders.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] text-white/50 font-black uppercase mb-1 tracking-widest">Status</p>
            <p className="text-[10px] font-black uppercase tracking-tight">Nível Bronze</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Histórico de Pedidos</h3>
          <Package size={14} className="text-orange-600" />
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-orange-600" />
              <p className="text-[10px] font-black text-slate-300 uppercase">Buscando no Riacho...</p>
            </div>
          ) : orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 relative group transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                  {order.status}
                </span>
                <p className="text-[9px] font-bold text-slate-200 uppercase">#{order.id.slice(0, 4)}</p>
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-2 line-clamp-1">{order.product_names}</h4>
              <p className="text-[10px] text-slate-400 font-medium mb-4 flex items-center gap-1">
                <Smartphone size={10} /> {order.last_location}
              </p>

              {order.status === 'Entregue' && (
                <button 
                  onClick={() => setReviewOrder(order)}
                  className="w-full pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:bg-orange-50 py-2 rounded-xl transition-colors"
                >
                  <Star size={12} fill="currentColor" /> Avaliar Produto
                </button>
              )}
            </div>
          ))}
          {!loading && orders.length === 0 && (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
               <Package size={32} className="text-slate-100 mx-auto mb-4" />
               <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Nada por aqui ainda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Sua Avaliação</h3>
              <button onClick={() => setReviewOrder(null)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors"><X size={18} /></button>
            </div>
            
            <div className="flex justify-center gap-3 mb-8">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} className="transition-transform active:scale-90 hover:scale-110">
                  <Star size={36} className={star <= reviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'} />
                </button>
              ))}
            </div>

            <textarea 
              placeholder="Como foi sua experiência com este produto?"
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 text-sm h-28 mb-6 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />

            <button 
              onClick={submitReview}
              disabled={submittingReview}
              className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl uppercase tracking-[0.15em] text-xs shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {submittingReview ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
