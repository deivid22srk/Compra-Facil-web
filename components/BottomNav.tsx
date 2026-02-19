
import React from 'react';
import { Home, LayoutGrid, ShoppingBag, User, Search } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
  cartCount: number;
  isGuest: boolean;
  user: any;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate, cartCount, isGuest, user }) => {
  const isAdmin = user?.user_metadata?.is_admin === true;

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 glass border-t border-slate-100 z-50">
      <div className="grid grid-cols-5 h-full items-center px-4">
        
        {/* Slot 1: Home */}
        <button 
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${activeView === 'home' ? 'text-orange-600 scale-105' : 'text-slate-300'}`}
        >
          <Home size={18} fill={activeView === 'home' ? 'currentColor' : 'none'} fillOpacity={0.1} />
          <span className="text-[7px] font-black uppercase tracking-widest">Início</span>
        </button>

        {/* Slot 2: Admin ou Vazio */}
        {isAdmin ? (
          <button 
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeView === 'admin' ? 'text-orange-600 scale-105' : 'text-slate-300'}`}
            onClick={() => onNavigate('admin')}
          >
            <LayoutGrid size={18} fill={activeView === 'admin' ? 'currentColor' : 'none'} fillOpacity={0.1} />
            <span className="text-[7px] font-black uppercase tracking-widest">Admin</span>
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-20">
             <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
          </div>
        )}

        {/* Slot 3: CART (Sempre Centralizado) */}
        <div className="relative flex justify-center">
          <button 
            onClick={() => onNavigate('cart')}
            className="absolute -top-10 w-14 h-14 rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-500/30 flex items-center justify-center hover:scale-105 active:scale-90 transition-all border-4 border-white"
          >
            <div className="relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[7px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-orange-600">
                  {cartCount}
                </span>
              )}
            </div>
          </button>
          <span className={`mt-8 text-[7px] font-black uppercase tracking-widest ${activeView === 'cart' ? 'text-orange-600' : 'text-slate-300'}`}>Sacola</span>
        </div>

        {/* Slot 4: Profile */}
        <button 
          onClick={() => onNavigate('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${activeView === 'profile' ? 'text-orange-600 scale-105' : 'text-slate-300'}`}
        >
          <User size={18} fill={activeView === 'profile' ? 'currentColor' : 'none'} fillOpacity={0.1} />
          <span className="text-[7px] font-black uppercase tracking-widest">Perfil</span>
        </button>

        {/* Slot 5: Search */}
        <button 
          onClick={() => onNavigate('search')}
          className={`flex flex-col items-center justify-center gap-1 transition-all ${activeView === 'search' ? 'text-orange-600 scale-105' : 'text-slate-300'}`}
        >
          <Search size={18} />
          <span className="text-[7px] font-black uppercase tracking-widest">Buscar</span>
        </button>

      </div>
    </div>
  );
};

export default BottomNav;
