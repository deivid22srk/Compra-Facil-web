
import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User, Lock } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  cartCount: number;
  isGuest: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, cartCount, isGuest }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 glass border-t border-slate-100 px-8 flex items-center justify-between z-50">
      <button 
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'home' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
      >
        <Home size={22} fill={activeView === 'home' ? 'currentColor' : 'none'} fillOpacity={0.1} />
        <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
      </button>

      <button 
        className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'admin' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
        onClick={() => onNavigate('admin')}
      >
        {isGuest ? (
          <div className="flex flex-col items-center gap-1.5 opacity-40">
            <Lock size={22} />
            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
          </div>
        ) : (
          <>
            <LayoutGrid size={22} fill={activeView === 'admin' ? 'currentColor' : 'none'} fillOpacity={0.1} />
            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
          </>
        )}
      </button>

      <div className="relative -top-8">
        <button 
          onClick={() => onNavigate('cart')}
          className="w-18 h-18 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-4 border-white"
        >
          <div className="relative">
            <ShoppingBag size={26} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-indigo-600">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </div>

      <button 
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
      >
        <User size={22} fill={activeView === 'profile' ? 'currentColor' : 'none'} fillOpacity={0.1} />
        <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
      </button>

      <button 
        onClick={() => onNavigate('search')}
        className={`flex flex-col items-center gap-1.5 transition-all ${activeView === 'search' ? 'text-indigo-600 scale-110' : 'text-slate-300'}`}
      >
        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">CF</div>
        <span className="text-[9px] font-black uppercase tracking-widest">Menu</span>
      </button>
    </div>
  );
};

export default BottomNav;
