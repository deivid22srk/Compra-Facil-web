
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, LogOut, ArrowLeft, Loader2, MapPin, CheckCircle2, Package, X, Box, ExternalLink } from 'lucide-react';
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
    category: 'Produtos',
    stock_quantity: '1',
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
      stock_quantity: parseInt(formData.stock_quantity),
      rating: 5,
      rating_count: 0
    }]);

    if (!error) {
      setIsAdding(false);
      setFormData({ name: '', description: '', price: '', original_price: '', category: 'Produtos', stock_quantity: '1', image_urls: [] });
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
    const { error } = await supabase.from('orders').update({ 
      status: newStatus,
      last_location: newStatus === 'Entregue' ? 'Entregue no destino' : (newStatus === 'Saindo para entrega' ? 'Em trânsito no Riacho' : 'Processando')
    }).eq('id', id);
    if (!error) fetchOrders();
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen pb-24 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 bg-white shadow-sm rounded-xl">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-black text-slate-900">Gerenciar Riacho</h1>
        </div>
        <button onClick={async () => await supabase.auth.signOut()} className="p-2.5 text-rose-500 bg-white shadow-sm rounded-xl">
          <LogOut size={18} />
        </button>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-xl mb-6">
        <button onClick={() => setActiveTab('products')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Estoque</button>
        <button onClick={() => setActiveTab('orders')} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>Pedidos</button>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-3">
          {!isAdding ? (
            <>
              <button onClick={() => setIsAdding(true)} className="w-full bg-orange-600 text-white p-4 rounded-2xl font-black shadow-lg shadow-orange-50 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                <Plus size={18} /> Novo Produto/Serviço
              </button>
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-4 border border-slate-50">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl overflow-hidden p-1 flex items-center justify-center">
                    <img src={p.image_urls?.[0]} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-800">{p.name}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-orange-600 font-black">R$ {p.price}</p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase ${p.stock_quantity > 0 ? 'bg-slate-100 text-slate-400' : 'bg-rose-100 text-rose-600'}`}>
                        {p.stock_quantity > 0 ? `${p.stock_quantity} un` : 'Esgotado'}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="p-2 text-slate-300">
                    {deletingId === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </div>
              ))}
            </>
          ) : (
            <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl space-y-4 border border-slate-50 animate-in slide-in-from-bottom duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Fotos (Serão ajustadas para 1:1)</label>
              <div className="grid grid-cols-3 gap-2">
                {formData.image_urls.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-50">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-rose-500 text-white rounded-lg p-1 shadow-md">
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1">
                  <Plus size={20} className="text-slate-300" />
                  <span className="text-[8px] font-black text-slate-300 uppercase">Adicionar</span>
                </button>
              </div>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />

              <div className="space-y-3">
                <input placeholder="Nome do Produto" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs font-bold border border-slate-100" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Preço (R$)</label>
                    <input type="number" step="0.01" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs font-bold border border-slate-100" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Estoque (Qtd)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs font-bold border border-slate-100" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} required />
                  </div>
                </div>

                <select 
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs font-bold border border-slate-100" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                >
                  <option value="Produtos">Produtos</option>
                  <option value="Serviços">Serviços</option>
                </select>
                
                <textarea placeholder="Descrição detalhada..." className="w-full p-4 bg-slate-50 rounded-2xl outline-none text-xs font-medium border border-slate-100 h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/10">
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Publicar no Riacho'}
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500">Cancelar</button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl text-center border border-slate-100">
              <Package size={32} className="text-slate-100 mx-auto mb-4" />
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Nenhum pedido realizado.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {order.status}
                    </span>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">#{order.id.slice(0, 8)}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">R$ {order.total_price.toLocaleString('pt-BR')}</p>
                </div>
                
                <div className="space-y-1 mb-4">
                  <p className="text-xs font-bold text-slate-800 uppercase">{order.user_email.split('@')[0]}</p>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2">{order.product_names}</p>
                </div>

                <div className="flex gap-2 border-t border-slate-50 pt-4">
                  <a 
                    href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-50 text-slate-600 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border border-slate-100"
                  >
                    <MapPin size={12} /> Mapa
                  </a>
                  <button 
                    onClick={() => updateOrderStatus(order.id, order.status === 'Processando' ? 'Saindo para entrega' : 'Entregue')}
                    disabled={order.status === 'Entregue'}
                    className={`flex-[2] py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${order.status === 'Entregue' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-600 text-white'}`}
                  >
                    {order.status === 'Entregue' ? <CheckCircle2 size={12} /> : <Box size={12} />}
                    {order.status === 'Processando' ? 'Enviar' : (order.status === 'Saindo para entrega' ? 'Finalizar' : 'Entregue')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
