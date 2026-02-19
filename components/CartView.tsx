
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Loader2, Navigation, CheckCircle2, ShoppingCart, ShieldCheck } from 'lucide-react';
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
  const [locationError, setLocationError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cart.length > 0 ? 10.00 : 0;
  const total = subtotal + shipping;

  const handleGetLocation = () => {
    setLoading(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Navegador sem suporte GPS.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLocationError('Ative o GPS para continuar.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckout = async () => {
    if (!user) return onGoToAuth();
    if (!location) return setLocationError('Localização obrigatória.');

    setLoading(true);
    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        user_email: user.email,
        product_names: cart.map(i => `${i.quantity}x ${i.name}`).join(', '),
        total_price: total,
        status: 'Processando',
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        payment_method: 'Pagamento na Entrega'
      });

      if (error) throw error;
      alert('Pedido realizado! Agora é só aguardar em casa.');
      onOrderSuccess();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao confirmar: ' + (err.message || 'Verifique sua conexão.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-slate-50 p-6 flex flex-col pb-12 transition-colors">
      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="w-12 h-12 bg-white shadow-sm rounded-2xl flex items-center justify-center text-slate-800 active:scale-90 transition-all">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
        <div className="w-12" />
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-white rounded-4xl flex items-center justify-center mb-6 shadow-sm">
            <ShoppingCart size={32} className="text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Sacola Vazia</h3>
          <p className="text-slate-400 text-sm mb-10">Que tal adicionar alguns itens primeiro?</p>
          <button onClick={onBack} className="bg-indigo-600 text-white font-black py-4.5 px-10 rounded-3xl shadow-xl shadow-indigo-100 uppercase tracking-widest active:scale-95 transition-all">
            Explorar Loja
          </button>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Seus Produtos</h3>
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-4xl shadow-sm border border-transparent">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 flex items-center justify-center">
                  <img src={item.image_url} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-indigo-600 font-black text-xs">R$ {item.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">-</button>
                  <span className="text-xs font-black">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>

          <div id="location-section" className="bg-white rounded-[40px] p-8 shadow-sm space-y-6 border border-transparent">
             <div className={`p-5 rounded-3xl border-2 transition-all ${location ? 'border-emerald-500 bg-emerald-50' : (locationError ? 'border-rose-100 bg-rose-50' : 'border-slate-50 bg-slate-50')}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-300'}`}>
                    {location ? <CheckCircle2 size={24} /> : <MapPin size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Entrega Local</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                      {location ? 'Localização Capturada ✓' : (locationError || 'GPS Obrigatório')}
                    </p>
                  </div>
                </div>
                {!location && (
                  <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full mt-5 bg-white text-indigo-600 font-black py-4 rounded-2xl border border-indigo-50 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                    CLIQUE PARA MARCAR PIN
                  </button>
                )}
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Taxa de Entrega</span>
                  <span>R$ {shipping.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-slate-900 pt-2">
                  <span>Total</span>
                  <span className="text-indigo-600">R$ {total.toLocaleString('pt-BR')}</span>
                </div>
             </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={handleCheckout}
              disabled={loading || !location}
              className={`w-full font-black py-5 rounded-4xl uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${loading || !location ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white shadow-indigo-100'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
              <ShieldCheck size={12} />
              Pagamento 100% Protegido
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
