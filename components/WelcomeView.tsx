
import React from 'react';
import { ShoppingBag, ArrowRight, UserCircle2, ShieldCheck } from 'lucide-react';

interface WelcomeViewProps {
  onStartAsGuest: () => void;
  onGoToAuth: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onStartAsGuest, onGoToAuth }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col p-8 justify-between animate-in fade-in duration-700">
      <div className="mt-20 text-center">
        <div className="w-20 h-20 bg-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-200 animate-bounce">
          <ShoppingBag size={36} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">CompraFácil</h1>
        <div className="space-y-2">
          <p className="text-slate-500 max-w-[280px] mx-auto text-sm leading-relaxed">
            Sua loja favorita na palma da mão.
          </p>
          <div className="inline-block bg-orange-50 px-4 py-2 rounded-2xl">
            <p className="text-[11px] font-black text-orange-600 uppercase tracking-wider">
              📍 Exclusivo: Sítio Riacho dos Barreiros
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <button 
          onClick={onGoToAuth}
          className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-100 flex items-center justify-center gap-3 transition-transform active:scale-95 group"
        >
          <UserCircle2 size={20} />
          Começar Agora
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button 
          onClick={onStartAsGuest}
          className="w-full bg-slate-50 text-slate-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
        >
          Entrar como Visitante
        </button>

        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest text-center">
          <ShieldCheck size={12} />
          Entregas Rápidas no Riacho dos Barreiros
        </div>
      </div>
    </div>
  );
};

export default WelcomeView;
