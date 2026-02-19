
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, LogOut, ArrowLeft, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Product, Order } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: 'Electronics',
    image_url: ''
  });

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) return alert('Selecione uma imagem para o produto.');
    setLoading(true);
    
    const { error } = await supabase.from('products').insert([{
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      image_url: formData.image_url,
      rating: 5,
      rating_count: 0
    }]);

    if (!error) {
      setIsAdding(false);
      setFormData({ name: '', description: '', price: '', original_price: '', category: 'Electronics', image_url: '' });
      fetchProducts();
    } else {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir produto permanentemente?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from('orders').update({ 
      status: newStatus,
      last_location: newStatus === 'Entregue' ? 'Entregue ao cliente' : 'Em trânsito local'
    }).eq('id', id);
    if (!error) fetchOrders();
    setLoading(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-24 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-3 bg-white shadow-sm rounded-2xl transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-900">Admin</h1>
        </div>
        <button onClick={async () => await supabase.auth.signOut()} className="p-3 text-rose-500 bg-white shadow-sm rounded-2xl">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-8">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Produtos</button>
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Pedidos</button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-4">
          {!isAdding ? (
            <>
              <button onClick={() => setIsAdding(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-3xl font-black shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> ADICIONAR PRODUTO
              </button>
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 border border-transparent">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden p-1 flex items-center justify-center">
                    <img src={p.image_url} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                    <p className="text-xs text-indigo-600 font-black">R$ {p.price}</p>
                  </div>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-3 text-slate-300 hover:text-rose-500 transition-colors">
                    {deletingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave} className="bg-white p-6 rounded-[32px] space-y-5 border border-transparent animate-in slide-in-from-bottom duration-300">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-48 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
              >
                {formData.image_url ? (
                  <img src={formData.image_url} className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Imagem</span>
                  </>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>

              <div className="space-y-4">
                <input placeholder="Nome do Produto" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="flex gap-4">
                  <input placeholder="Preço" type="number" step="0.01" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input placeholder="Original (opcional)" type="number" step="0.01" className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
                </div>
                <textarea placeholder="Descrição curta" className="w-full p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500 h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <><Check size={20} /> SALVAR</>}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 py-5 rounded-2xl font-black uppercase tracking-widest">Sair</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 border border-transparent">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{order.user_email}</p>
                <span className="text-[10px] font-bold text-slate-300">#{order.id.slice(0,6)}</span>
              </div>
              <h4 className="text-sm font-bold">{order.product_names}</h4>
              <div className="flex gap-2 pt-2">
                <button onClick={() => updateOrderStatus(order.id, 'Em Trânsito')} className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${order.status === 'Em Trânsito' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Em Trânsito</button>
                <button onClick={() => updateOrderStatus(order.id, 'Entregue')} className={`flex-1 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${order.status === 'Entregue' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>Entregue</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="py-20 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">Sem pedidos ainda</div>}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
