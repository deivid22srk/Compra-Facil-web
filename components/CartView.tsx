
import React, { useState } from 'react';
import { ArrowLeft, X, Minus, Plus, MapPin, Loader2, Navigation, CheckCircle2, UserPlus, AlertCircle, ShoppingCart } from 'lucide-react';
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
      setLocationError('Geolocalização não suportada.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.error("Erro GPS:", err);
        let msg = 'Erro ao obter localização.';
        if (err.code === 1) msg = 'Permissão negada. Ative o GPS.';
        else if (err.code === 2) msg = 'Sinal de GPS indisponível.';
        else if (err.code === 3) msg = 'Tempo limite esgotado.';
        setLocationError(msg);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleCheckout = async () => {
    if (!user) {
      onGoToAuth();
      return;
    }
    
    if (!location) {
      setLocationError('Localização obrigatória.');
      const locBtn = document.getElementById('location-section');
      locBtn?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const productNames = cart.map(i => `${i.quantity}x ${i.name}`).join(', ');
      
      const { data, error } = await supabase.from('orders').insert({
        user_id: user.id,
        user_email: user.email,
        product_names: productNames,
        total_price: total,
        status: 'Processando',
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        payment_method: 'Pagamento na Entrega'
      }).select();

      if (error) throw error;
      
      onOrderSuccess();
    } catch (err: any) {
      console.error("Erro Checkout:", err);
      alert('Falha ao confirmar pedido: ' + (err.message || 'Erro de conexão.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 min-h-screen bg-slate-50 p-6 flex flex-col pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800 active:scale-90 transition-transform">
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Checkout</h2>
        <div className="w-12" />
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
          <ShoppingCart size={48} className="text-slate-200 mb-6" />
          <h3 className="text-xl font-black text-slate-900 mb-2">Carrinho vazio</h3>
          <button onClick={onBack} className="mt-4 bg-indigo-600 text-white font-black py-4 px-10 rounded-[24px] shadow-lg">Explorar</button>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {/* Lista de Itens */}
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-[32px] shadow-sm border border-white">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 flex items-center justify-center">
                  <img src={item.image_url} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-indigo-600 font-black text-xs">R$ {item.price.toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.id, -1)} className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">-</button>
                  <span className="text-xs font-bold">{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, 1)} className="w-6 h-6 bg-slate-800 text-white rounded-lg flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Configuração */}
          <div id="location-section" className="bg-white rounded-[40px] p-8 shadow-sm space-y-6 border border-white">
             <div className={`p-5 rounded-[32px] border-2 transition-all ${location ? 'border-emerald-500 bg-emerald-50' : (locationError ? 'border-rose-100 bg-rose-50' : 'border-slate-50 bg-slate-50')}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${location ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'}`}>
                    {location ? <CheckCircle2 size={24} /> : <MapPin size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Endereço de Entrega</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {location ? `Localização capturada ✓` : (locationError || 'Acesso ao GPS necessário')}
                    </p>
                  </div>
                </div>
                {!location && (
                  <button 
                    onClick={handleGetLocation}
                    disabled={loading}
                    className="w-full mt-4 bg-white text-indigo-600 font-black py-4 rounded-2xl border border-indigo-100 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                    Pegar Localização
                  </button>
                )}
             </div>

             <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900">
                  <span>Total</span>
                  <span className="text-indigo-600">R$ {total.toLocaleString('pt-BR')}</span>
                </div>
             </div>
          </div>

          {/* Botões de Ação */}
          <div className="mt-4 space-y-4">
            {!user ? (
              <button onClick={onGoToAuth} className="w-full bg-slate-900 text-white font-black py-5 rounded-[32px] shadow-xl uppercase tracking-widest">
                Entrar para Comprar
              </button>
            ) : (
              <button 
                onClick={handleCheckout}
                disabled={loading || !location}
                className={`w-full font-black py-5 rounded-[32px] uppercase tracking-widest shadow-xl transition-all ${loading || !location ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white'}`}
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar Pedido'}
              </button>
            )}
            {user && !location && !loading && (
              <p className="text-center text-[10px] font-black text-indigo-500 animate-pulse">
                PEGUE SUA LOCALIZAÇÃO ACIMA PARA HABILITAR
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartView;
