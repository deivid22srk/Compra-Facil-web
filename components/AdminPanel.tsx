
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutGrid, Image as ImageIcon, Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Product } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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

  useEffect(() => {
    fetchProducts();
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
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este produto?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const generateAiDescription = async () => {
    if (!formData.name) return alert('Dê um nome ao produto primeiro');
    setAiGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Escreva uma descrição de marketing curta e atraente para o produto: ${formData.name}. Categoria: ${formData.category}. Em português do Brasil. Máximo de 150 caracteres.`,
      });
      setFormData(prev => ({ ...prev, description: response.text || '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Admin</h1>
            <p className="text-xs text-slate-400">Gerencie seus produtos</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-3 text-red-500 bg-white rounded-2xl shadow-sm">
          <LogOut size={20} />
        </button>
      </div>

      {!isAdding ? (
        <div className="space-y-4">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> Novo Produto
          </button>

          <div className="grid gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl shadow-sm flex items-center gap-4 group">
                <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold">R$ {p.price}</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-[32px] shadow-sm space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Novo Produto</h2>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-400">Cancelar</button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
            <input 
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Tênis Nike Air"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Preço</label>
              <input 
                required type="number" step="0.01"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Preço Antigo</label>
              <input 
                type="number" step="0.01"
                className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
                value={formData.original_price}
                onChange={e => setFormData({...formData, original_price: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
              <button 
                type="button" 
                onClick={generateAiDescription}
                disabled={aiGenerating}
                className="text-[10px] flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
              >
                <Sparkles size={10} /> {aiGenerating ? 'Gerando...' : 'IA Gerar'}
              </button>
            </div>
            <textarea 
              rows={3}
              className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">URL Imagem</label>
            <div className="flex gap-2">
              <input 
                required
                className="flex-1 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-xs"
                value={formData.image_url}
                onChange={e => setFormData({...formData, image_url: e.target.value})}
              />
              <button type="button" className="p-4 bg-slate-100 rounded-2xl text-slate-400">
                <ImageIcon size={20} />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 uppercase tracking-widest mt-6 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminPanel;
