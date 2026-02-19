
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Loader2, Navigation, CheckCircle2, ShoppingCart, ShieldCheck, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../supabaseClient';

interface CartViewProps {
  cart: CartItem[];
  user: any;
  onUpdateQuantity: (id: string, delta: number) => void;
  onBack: () => void;
  onOrderSuccess: () => void;
  onGoToAuth: () => void;
}

const CartView: React.FC<CartViewProps> = ({ cart, user, onUpdateQuantity, onBack, onOrderSuccess, onGoToAuth }) => {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [locationError, setLocationError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cart.length > 0 ? 5.00 : 0; 
  const total = subtotal + shipping;

  const handleGetLocation = () => {
    setLoading(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Sem suporte GPS.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setLocationError('Ative o GPS para o Riacho.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckout = async () => {
    if (!user) return onGoToAuth();
    if (!whatsapp.trim()) return alert('Informe seu WhatsApp.');
    if (!location) return setLocationError('Marque sua localização.');

    setLoading(true);
    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        user_email: user.email,
        whatsapp_number: whatsapp,
        product_names: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total_price: total,
        status: 'Processando',
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        payment_method: 'Pagamento na Entrega'
      });

      if (error) throw error;
      alert('Pedido confirmado! Entregamos logo mais no Riacho dos Barreiros.');
      onOrderSuccess();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-slate-50 flex flex-col transition-colors">
      <div className="p-6 flex items-center justify-between">
        <button onClick={onBack} className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-800 active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Minha Sacola</h2>
        <div className="w-10" />
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50">
            <ShoppingCart size={28} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Sacola Vazia</h3>
          <p className="text-slate-400 text-xs mb-8">O Riacho tem ótimas ofertas esperando por você!</p>
          <button onClick={onBack} className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/10 uppercase tracking-widest active:scale-95 transition-all">
            Explorar Loja
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col px-6 pb-10">
          <div className="space-y-3 mb-8">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                <div className="w-16 h-16 bg-slate-50 rounded-xl p-1 flex items-center justify-center overflow-hidden">
                  <img src={item.image_urls?.[0] || PLACEHOLDER_IMAGE} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 py-1">
                  <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-orange-600 font-black text-xs mt-1">R$ {item.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 transition-colors active:bg-slate-200">-</button>
                  <span className="text-xs font-black w-3 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center transition-opacity active:opacity-80">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-50 space-y-6 mt-auto">
             <div className="space-y-4">
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="tel"
                    placeholder="Seu WhatsApp para entrega"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-orange-500/10 text-xs font-bold transition-all"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>

                <div className={`p-4 rounded-2xl border-2 transition-all ${location ? 'border-emerald-500 bg-emerald-50' : (locationError ? 'border-rose-100 bg-rose-50' : 'border-slate-50 bg-slate-50')}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
                      {location ? <CheckCircle2 size={18} /> : <MapPin size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">Endereço Riacho</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                        {location ? 'Localização Confirmada ✓' : (locationError || 'Clique abaixo para marcar')}
                      </p>
                    </div>
                  </div>
                  {!location && (
                    <button 
                      onClick={handleGetLocation}
                      disabled={loading}
                      className="w-full mt-4 bg-white text-orange-600 font-black py-3 rounded-xl border border-orange-50 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                      Marcar minha casa
                    </button>
                  )}
                </div>
             </div>

             <div className="pt-4 border-t border-slate-50 space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-1">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toLocaleString('pt-BR')}</span>
                </div>
             </div>

             <button 
                onClick={handleCheckout}
                disabled={loading || !location}
                className={`w-full font-black py-4.5 rounded-2xl uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 text-xs shadow-xl ${loading || !location ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed' : 'bg-orange-600 text-white shadow-orange-500/20 active:scale-95'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Confirmar Pedido'}
              </button>
          </div>
          
          <p className="text-center text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-6">
            Pagamento em mãos no Riacho
          </p>
        </div>
      )}
    </div>
  );
};

export default CartView;
