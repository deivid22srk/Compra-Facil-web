
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
  const shipping = cart.length > 0 ? 5.00 : 0; // Taxa local menor
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
    <div className="animate-in fade-in duration-500 min-h-screen bg-slate-50 p-6 flex flex-col pb-12 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-800 active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Checkout</h2>
        <div className="w-10" />
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-50">
            <ShoppingCart size={28} className="text-slate-200" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">Sua sacola está vazia</h3>
          <p className="text-slate-400 text-xs mb-8">Dê uma olhada nos produtos do Riacho!</p>
          <button onClick={onBack} className="bg-orange-600 text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-orange-50 uppercase tracking-widest active:scale-95 transition-all">
            Ver Produtos
          </button>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Seu Pedido</h3>
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-slate-50">
                <div className="w-14 h-14 bg-slate-50 rounded-xl p-1 flex items-center justify-center">
                  <img src={item.image_urls?.[0] || PLACEHOLDER_IMAGE} className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-orange-600 font-black text-xs">R$ {item.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold">-</button>
                  <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-sm space-y-6 border border-slate-50">
             <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contato & Entrega</h3>
                <div className="relative">
                  <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="tel"
                    placeholder="Seu WhatsApp"
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-orange-500 text-xs font-bold"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
             </div>

             <div className={`p-4 rounded-2xl border-2 transition-all ${location ? 'border-emerald-500 bg-emerald-50' : (locationError ? 'border-rose-100 bg-rose-50' : 'border-slate-50 bg-slate-50')}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-slate-300'}`}>
                    {location ? <CheckCircle2 size={20} /> : <MapPin size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">Pin de Entrega</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                      {location ? 'Localização salva ✓' : (locationError || 'Apenas Riacho dos Barreiros')}
                    </p>
                  </div>
                </div>
                {!location && (
                  <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full mt-4 bg-white text-orange-600 font-black py-3 rounded-xl border border-orange-50 flex items-center justify-center gap-2 shadow-sm active:scale-95 text-[10px]"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
                    MARCAR NO RIACHO
                  </button>
                )}
             </div>

             <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  <span>Frete Local</span>
                  <span>R$ {shipping.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-1">
                  <span>Total</span>
                  <span className="text-orange-600">R$ {total.toLocaleString('pt-BR')}</span>
                </div>
             </div>
          </div>

          <div className="pt-2 space-y-4">
            <button 
              onClick={handleCheckout}
              disabled={loading || !location}
              className={`w-full font-black py-4.5 rounded-2xl uppercase tracking-[0.15em] shadow-xl transition-all flex items-center justify-center gap-3 text-sm ${loading || !location ? 'bg-slate-200 text-slate-400' : 'bg-orange-600 text-white shadow-orange-50'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
            </button>
            
            <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
              * Pagamento na entrega em mãos no Sítio Riacho dos Barreiros e Região Próxima.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
