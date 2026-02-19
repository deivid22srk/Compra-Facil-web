
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, LogOut, ArrowLeft, Check, Image as ImageIcon, Loader2, MessageCircle, Map as MapIcon, X } from 'lucide-react';
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
    image_urls: [] as string[]
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
    const files = e.target.files;
    if (files) {
      (Array.from(files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ 
            ...prev, 
            image_urls: [...prev.image_urls, reader.result as string] 
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.image_urls.length === 0) return alert('Selecione ao menos uma imagem.');
    setLoading(true);
    
    const { error } = await supabase.from('products').insert([{
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      image_urls: formData.image_urls,
      rating: 5,
      rating_count: 0
    }]);

    if (!error) {
      setIsAdding(false);
      setFormData({ name: '', description: '', price: '', original_price: '', category: 'Electronics', image_urls: [] });
      fetchProducts();
    } else {
      alert('Erro: ' + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir produto?')) return;
    setDeletingId(id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase.from('orders').update({ 
      status: newStatus,
      last_location: newStatus === 'Entregue' ? 'Entregue no Riacho' : 'Saindo para entrega'
    }).eq('id', id);
    if (!error) fetchOrders();
    setLoading(false);
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const openWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanNumber}`, '_blank');
  };

  const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400";

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-24 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 bg-white shadow-sm rounded-xl">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-slate-900">Admin Riacho</h1>
        </div>
        <button onClick={async () => await supabase.auth.signOut()} className="p-2.5 text-rose-500 bg-white shadow-sm rounded-xl">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Produtos</button>
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Pedidos</button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-3">
          {!isAdding ? (
            <>
              <button onClick={() => setIsAdding(true)} className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-orange-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                <Plus size={18} /> Novo Produto
              </button>
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-4 border border-slate-50">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    <img src={p.image_urls?.[0] || PLACEHOLDER_IMAGE} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                    <p className="text-[10px] text-orange-600 font-black">R$ {p.price}</p>
                  </div>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-2 text-slate-300">
                    {deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl space-y-4 border border-slate-50 animate-in slide-in-from-bottom duration-300">
              <div className="grid grid-cols-4 gap-2">
                {formData.image_urls.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-rose-500 text-white rounded-md p-0.5">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                  <Plus size={20} className="text-slate-300" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

              <div className="space-y-3">
                <input placeholder="Nome" className="w-full p-3 bg-slate-50 rounded-xl outline-none text-xs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                <div className="flex gap-3">
                  <input placeholder="Preço" type="number" className="flex-1 p-3 bg-slate-50 rounded-xl outline-none text-xs" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input placeholder="Categoria" className="flex-1 p-3 bg-slate-50 rounded-xl outline-none text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <textarea placeholder="Descrição" className="w-full p-3 bg-slate-50 rounded-xl outline-none text-xs h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-[2] bg-orange-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest">
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500">Sair</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{order.user_email}</p>
                  <button onClick={() => openWhatsApp(order.whatsapp_number)} className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg mt-1">
                    <MessageCircle size={12} /> {order.whatsapp_number}
                  </button>
                </div>
                <span className="text-[9px] font-bold text-slate-300 uppercase">#{order.id.slice(0,4)}</span>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl">
                <h4 className="text-[11px] font-bold text-slate-800">{order.product_names}</h4>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => openInMaps(order.delivery_lat, order.delivery_lng)} className="flex items-center gap-1.5 text-[10px] text-orange-600 font-black uppercase bg-orange-50 px-3 py-1.5 rounded-lg">
                  <MapIcon size={12} /> Localização
                </button>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${order.status === 'Entregue' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => updateOrderStatus(order.id, 'Em Trânsito')} className="flex-1 p-2.5 rounded-xl text-[9px] font-black uppercase bg-slate-100 text-slate-500">Em Trânsito</button>
                <button onClick={() => updateOrderStatus(order.id, 'Entregue')} className="flex-1 p-2.5 rounded-xl text-[9px] font-black uppercase bg-orange-600 text-white shadow-lg shadow-orange-50">Entregue</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="py-16 text-center text-slate-300 font-bold uppercase text-[10px]">Sem pedidos no Riacho</div>}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
