
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutGrid, Image as ImageIcon, Sparkles, LogOut, ArrowLeft, Package, Check, RefreshCw, User as UserIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Product, Order } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: 'Electronics',
    image_url: 'https://picsum.photos/seed/' + Math.random() + '/400/400'
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      alert('Erro ao salvar produto: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este produto?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const updateOrderStatus = async (id: string, newStatus: string, lastLocation: string) => {
    setLoading(true);
    const { error } = await supabase.from('orders').update({ 
      status: newStatus, 
      last_location: lastLocation,
      tracking_code: `BR${Math.floor(Math.random() * 90000000) + 10000000}SH`
    }).eq('id', id);
    if (!error) fetchOrders();
    setLoading(false);
  };

  const generateAiDescription = async () => {
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
    if (!apiKey) return alert('Chave de IA não configurada no ambiente local.');
    if (!formData.name) return alert('Nome do produto é necessário.');
    
    setAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Descrição curta de marketing para: ${formData.name}. Categoria: ${formData.category}. Português.`,
      });
      setFormData(prev => ({ ...prev, description: response.text || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black text-slate-800">Admin</h1>
        </div>
        <button onClick={handleLogout} className="p-3 text-red-500 bg-white rounded-2xl shadow-sm">
          <LogOut size={20} />
        </button>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${activeTab === 'products' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Produtos</button>
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Pedidos</button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-4">
          {!isAdding ? (
            <>
              <button onClick={() => setIsAdding(true)} className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg">+ Novo Produto</button>
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-4">
                  <img src={p.image_url} className="w-12 h-12 object-contain" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                    <p className="text-xs text-indigo-600">R$ {p.price}</p>
                  </div>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-2 text-slate-300 hover:text-rose-500">
                    {deletingId === p.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave} className="bg-white p-6 rounded-[32px] space-y-4">
              <input placeholder="Nome" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input placeholder="Preço" type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Descrição</span>
                <button type="button" onClick={generateAiDescription} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">Gerar com IA</button>
              </div>
              <textarea placeholder="Descrição" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <input placeholder="URL da Imagem" className="w-full p-4 bg-slate-50 rounded-2xl outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black">Salvar</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm space-y-4">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{order.user_email}</p>
              <h4 className="text-sm font-bold">{order.product_names}</h4>
              <div className="flex gap-2">
                <button onClick={() => updateOrderStatus(order.id, 'Em Trânsito', 'A caminho')} className={`flex-1 p-3 rounded-xl text-[10px] font-bold border ${order.status === 'Em Trânsito' ? 'bg-indigo-600 text-white' : 'border-slate-100'}`}>Trânsito</button>
                <button onClick={() => updateOrderStatus(order.id, 'Entregue', 'Entregue')} className={`flex-1 p-3 rounded-xl text-[10px] font-bold border ${order.status === 'Entregue' ? 'bg-emerald-500 text-white' : 'border-slate-100'}`}>Entregue</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
