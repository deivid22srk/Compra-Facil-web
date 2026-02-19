
import React, { useEffect, useState } from 'react';
import { User, Package, LogOut, Loader2, Smartphone, ChevronRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Order } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileViewProps {
  user: SupabaseUser | null;
  onBack: () => void;
  onAuthClick: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onBack, onAuthClick }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center text-center transition-colors">
        <div className="w-24 h-24 bg-white rounded-4xl shadow-sm flex items-center justify-center mb-8 border border-transparent">
          <User size={40} className="text-slate-200" />
        </div>
        <h2 className="text-2xl font-black mb-2">Acesse sua Conta</h2>
        <p className="text-slate-400 text-sm mb-10 px-8">Entre para acompanhar seus pedidos e ofertas exclusivas.</p>
        <button onClick={onAuthClick} className="w-full bg-indigo-600 text-white font-black py-4.5 rounded-3xl shadow-xl shadow-indigo-100 uppercase tracking-widest active:scale-95 transition-all">Entrar</button>
        <button onClick={onBack} className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">Voltar para Loja</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 transition-colors">
      <div className="bg-indigo-600 p-8 pt-14 rounded-b-[60px] text-white shadow-2xl shadow-indigo-500/10">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-4xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-2xl border border-white/10">👤</div>
          <div className="flex-1">
            <h2 className="text-2xl font-black leading-tight">{user.email?.split('@')[0]}</h2>
            <p className="text-xs text-white/60 font-medium">{user.email}</p>
          </div>
          <button onClick={async () => await supabase.auth.signOut()} className="p-3.5 bg-white/10 rounded-2xl border border-white/5 active:scale-90 transition-all">
            <LogOut size={20} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-widest">Pedidos</p>
            <p className="text-2xl font-black">{orders.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/5">
            <p className="text-[10px] text-white/50 font-black uppercase mb-1 tracking-widest">Status</p>
            <p className="text-base font-black uppercase tracking-tighter">Diamante</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">Rastreio <Smartphone size={18} className="text-indigo-600" /></h3>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" /></div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-[48px] shadow-sm text-center border border-transparent">
            <Package size={48} className="text-slate-100 mx-auto mb-4" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Nenhum pedido ativo</p>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-[40px] shadow-sm border border-transparent">
                <div className="flex justify-between items-start mb-5">
                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                    order.status === 'Entregue' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] font-black text-slate-300 tracking-tighter uppercase">ID: {order.id.slice(0, 8)}</p>
                </div>
                
                <h4 className="text-sm font-black text-slate-800 mb-6">{order.product_names}</h4>
                
                <div className="pl-4 border-l-2 border-slate-50 space-y-4">
                  <div className="relative">
                    <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-lg shadow-indigo-200"></div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Localização Atual</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">{order.last_location || 'Aguardando processamento'}</p>
                  </div>
                </div>

                {order.tracking_code && (
                  <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">COD: {order.tracking_code}</span>
                    <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">Mapa <ChevronRight size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
