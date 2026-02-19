
import React, { useState } from 'react';
import { ArrowLeft, X, Minus, Plus, MapPin, Loader2, Navigation, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { supabase } from '../supabaseClient';

interface CartViewProps {
  cart: CartItem[];
  user: any;
  onUpdateQuantity: (id: string, delta: number) => void;
  onBack: () => void;
  onOrderSuccess: () => void;
}

const CartView: React.FC<CartViewProps> = ({ cart, user, onUpdateQuantity, onBack, onOrderSuccess }) => {
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
      setLocationError('Geolocalização não suportada pelo seu navegador.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setLocationError('Não foi possível obter sua localização. Por favor, permita o acesso.');
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Faça login para finalizar seu pedido.');
      return;
    }
    if (!location) {
      alert('Precisamos da sua localização exata para a entrega.');
      return;
    }

    setLoading(true);
    const productNames = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
    
    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      user_email: user.email,
      product_names: productNames,
      total_price: total,
      status: 'Processando',
      delivery_lat: location.lat,
      delivery_lng: location.lng,
      payment_method: 'Pagamento na Entrega'
    });

    if (!error) {
      onOrderSuccess();
    } else {
      alert('Erro ao processar pedido: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-slate-50 p-6">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-900">Carrinho</h2>
        <div className="w-12" />
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <div className="w-32 h-32 bg-white rounded-[40px] flex items-center justify-center mb-6 shadow-sm">
            <X size={48} className="text-slate-100" />
          </div>
          <p className="font-black text-slate-400">Seu carrinho está vazio</p>
          <button onClick={onBack} className="mt-6 text-indigo-600 font-bold uppercase tracking-wider">Voltar às compras</button>
        </div>
      ) : (
        <div className="space-y-6 pb-40">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-white rounded-[32px] shadow-sm border border-white relative group">
                <div className="w-24 h-24 bg-slate-50 rounded-[24px] p-3 flex items-center justify-center">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 py-2 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 pr-8 line-clamp-1">{item.name}</h4>
                    <p className="text-indigo-600 font-black text-base">R$ {item.price.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 w-fit">
                    <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"><Minus size={14} /></button>
                    <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-90 transition-transform"><Plus size={14} /></button>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateQuantity(item.id, -item.quantity)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Location & Payment Section */}
          <div className="bg-white rounded-[40px] p-6 shadow-sm space-y-6 border border-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Finalizar Pedido</h3>
              <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                Na Entrega
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-3xl border-2 transition-all ${location ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                    {location ? <CheckCircle2 size={24} /> : <MapPin size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">Local de Entrega</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {location ? `Coordenadas: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Sua localização exata é obrigatória'}
                    </p>
                  </div>
                </div>
                {!location && (
                  <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full mt-4 bg-white text-indigo-600 font-black py-3 rounded-2xl border border-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                    Obter Localização Exata
                  </button>
                )}
                {locationError && <p className="mt-2 text-[10px] text-rose-500 font-bold text-center">{locationError}</p>}
              </div>

              <div className="p-4 rounded-3xl bg-amber-50 border border-amber-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">Pagamento na Entrega</p>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight">Pague ao receber seu produto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-2 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Subtotal:</span>
              <span className="font-black text-slate-800">R$ {subtotal.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Entrega:</span>
              <span className="font-black text-slate-800">R$ {shipping.toLocaleString('pt-BR')}</span>
            </div>
            <div className="h-px bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-xl font-black text-slate-900">Total:</span>
              <span className="text-2xl font-black text-indigo-600">R$ {total.toLocaleString('pt-BR')}</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={!location || loading}
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[32px] shadow-2xl shadow-indigo-200 uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartView;
