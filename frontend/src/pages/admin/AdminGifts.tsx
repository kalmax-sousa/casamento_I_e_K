import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Gift {
  id: string;
  name: string;
  description: string | null;
  specifications: string | null;
  storeLinks: string[];
  photoUrl: string | null;
  price: number;
  totalQuantity: number;
  purchasedQuantity: number;
}

interface Purchase {
  id: string;
  buyerName: string;
  message: string | null;
  paymentMethod: string;
  amountPaid: number;
  gift: { name: string };
  createdAt: string;
}

export function AdminGifts() {
  const navigate = useNavigate();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para saber se estamos editando ou criando
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);

  // Estados do Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [storeLinksInput, setStoreLinksInput] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('1');

  const fetchGiftsAndPurchases = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const giftsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gifts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGifts(await giftsRes.json());

      const purchasesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/purchases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (purchasesRes.ok) {
        setPurchases(await purchasesRes.json());
      }
    } catch (error) {
      console.error('Erro ao buscar dados', error);
    }
  };

  useEffect(() => {
    fetchGiftsAndPurchases();
  }, []);

  // Abre o modal para um NOVO presente
  const handleOpenNew = () => {
    setEditingGiftId(null);
    setName('');
    setDescription('');
    setSpecifications('');
    setStoreLinksInput('');
    setPrice('');
    setPhotoUrl('');
    setTotalQuantity('1');
    setIsModalOpen(true);
  };

  // Abre o modal para EDITAR um presente
  const handleEdit = (gift: Gift) => {
    setEditingGiftId(gift.id);
    setName(gift.name);
    setDescription(gift.description || '');
    setSpecifications(gift.specifications || '');
    setStoreLinksInput(gift.storeLinks ? gift.storeLinks.join('\n') : '');
    setPrice(gift.price.toString());
    setPhotoUrl(gift.photoUrl || '');
    setTotalQuantity(gift.totalQuantity.toString());
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este presente?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/gifts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Presente excluído!');
        fetchGiftsAndPurchases();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    }
  };

  // SALVAR (Criar ou Editar)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const token = localStorage.getItem('adminToken'); 

    const storeLinks = storeLinksInput.split(/[\n,]+/).map(l => l.trim()).filter(l => l !== '');
    
    // Se tem ID de edição, faz PUT, se não, faz POST
    const method = editingGiftId ? 'PUT' : 'POST';
    const url = editingGiftId 
      ? `${import.meta.env.VITE_API_URL}/api/admin/gifts/${editingGiftId}` 
      : `${import.meta.env.VITE_API_URL}/api/admin/gifts`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name, description, specifications, storeLinks, price: parseFloat(price), photoUrl, totalQuantity: parseInt(totalQuantity)
        }),
      });

      if (response.ok) {
        alert(editingGiftId ? 'Presente atualizado!' : 'Presente cadastrado!');
        setIsModalOpen(false);
        fetchGiftsAndPurchases();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      alert('Erro de conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-serif text-textMain">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#e2dec6] pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-800">← Voltar</button>
            <h1 className="text-3xl italic">Gestão de Presentes</h1>
          </div>
          <button 
            onClick={handleOpenNew}
            className="bg-olive text-white tracking-widest text-xs uppercase py-3 px-6 rounded hover:bg-opacity-90"
          >
            + Cadastrar Presente
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full relative mt-10 mb-10">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✕</button>
              <h2 className="text-xl italic mb-6 border-b pb-2">
                {editingGiftId ? 'Editar Presente' : 'Cadastrar Novo Presente'}
              </h2>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Nome do Presente *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Descrição</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Especificações (Opcional - Ex: Voltagem 220v, Cor Inox)</label>
                  <input value={specifications} onChange={e => setSpecifications(e.target.value)} type="text" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">Links das lojas (Opcional - Separe por linha)</label>
                  <textarea value={storeLinksInput} onChange={e => setStoreLinksInput(e.target.value)} rows={2} className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preço (R$) *</label>
                  <input required value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" className="w-full border border-[#e2dec6] rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Quantidade Desejada *</label>
                  <input required value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} type="number" min="1" className="w-full border border-[#e2dec6] rounded p-2" />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">URL da Imagem *</label>
                  <input required value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} type="url" placeholder="https://..." className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
                </div>

                <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
                  <button disabled={isLoading} type="submit" className="bg-olive text-white tracking-widest text-xs uppercase py-3 px-8 rounded">
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <h2 className="text-2xl italic mb-4 mt-12">Presentes Recebidos ({purchases.length})</h2>
        <div className="bg-white rounded-lg shadow-sm border border-[#e2dec6] overflow-hidden mb-12">
          <table className="w-full text-left">
            <thead className="bg-paper border-b border-[#e2dec6] text-xs tracking-widest uppercase text-gray-500">
              <tr>
                <th className="p-4">Convidado</th>
                <th className="p-4">Presente</th>
                <th className="p-4">Método</th>
                <th className="p-4">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map(p => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-semibold">{p.buyerName}</td>
                  <td className="p-4">{p.gift?.name}</td>
                  <td className="p-4"><span className="bg-gray-200 text-xs px-2 py-1 rounded">{p.paymentMethod}</span></td>
                  <td className="p-4 text-sm text-gray-600 italic">"{p.message || 'Sem mensagem'}"</td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">Nenhum presente recebido ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        
        <h2 className="text-2xl italic mb-4 mt-12">Estoque de Presentes ({gifts.length})</h2>
        <div className="bg-white rounded-lg shadow-sm border border-[#e2dec6] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-paper border-b border-[#e2dec6] text-xs tracking-widest uppercase text-gray-500">
              <tr>
                <th className="p-4">Presente</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Estoque</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map(gift => (
                <tr key={gift.id} className="border-b border-gray-100">
                  <td className="p-4">{gift.name}</td>
                  <td className="p-4">R$ {gift.price.toFixed(2)}</td>
                  <td className="p-4">{gift.purchasedQuantity} / {gift.totalQuantity} comprados</td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => handleEdit(gift)} className="text-blue-500 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDelete(gift.id)} className="text-red-500 hover:underline text-sm">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}