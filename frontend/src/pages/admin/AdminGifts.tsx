import { useState, useEffect } from 'react';

interface Gift {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  purchasedQuantity: number;
}

export function AdminGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados do Formulário
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [totalQuantity, setTotalQuantity] = useState('1');

  // Carrega a lista de presentes atual
  const fetchGifts = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/gifts');
      const data = await response.json();
      setGifts(data);
    } catch (error) {
      console.error('Erro ao buscar presentes', error);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  // Envia o novo presente para o backend
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Pega o token de onde você salvou no login
    const token = localStorage.getItem('adminToken'); 

    try {
      const response = await fetch('http://localhost:3333/api/admin/gifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // O crachá de acesso!
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          photoUrl,
          totalQuantity: parseInt(totalQuantity)
        }),
      });

      if (response.ok) {
        alert('Presente cadastrado com sucesso!');
        // Limpa o formulário
        setName('');
        setDescription('');
        setPrice('');
        setPhotoUrl('');
        setTotalQuantity('1');
        // Atualiza a lista na tela
        fetchGifts();
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
    <div className="max-w-4xl mx-auto py-10 px-4 font-serif text-textMain">
      <h1 className="text-3xl italic mb-8">Painel Admin - Presentes</h1>

      {/* Formulário de Cadastro */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e2dec6] mb-12">
        <h2 className="text-xl mb-4">Cadastrar Novo Presente</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Nome do Presente *</label>
            <input required value={name} onChange={e => setName(e.target.value)} type="text" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Preço Unitário (R$) *</label>
            <input required value={price} onChange={e => setPrice(e.target.value)} type="number" step="0.01" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Quantidade Desejada *</label>
            <input required value={totalQuantity} onChange={e => setTotalQuantity(e.target.value)} type="number" min="1" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">URL da Imagem</label>
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} type="url" placeholder="https://..." className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" />
          </div>

          <div className="col-span-1 md:col-span-2 flex justify-end mt-4">
            <button disabled={isLoading} type="submit" className="bg-olive text-white tracking-widest text-xs uppercase py-3 px-8 rounded hover:bg-opacity-90 disabled:opacity-50">
              {isLoading ? 'Salvando...' : 'Salvar Presente'}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Presentes Cadastrados */}
      <div>
        <h2 className="text-xl mb-4">Presentes Cadastrados ({gifts.length})</h2>
        <div className="bg-white rounded-lg shadow-sm border border-[#e2dec6] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-paper border-b border-[#e2dec6] text-sm tracking-widest uppercase text-gray-500">
                <th className="p-4 font-normal">Presente</th>
                <th className="p-4 font-normal">Preço</th>
                <th className="p-4 font-normal">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {gifts.map(gift => (
                <tr key={gift.id} className="border-b border-[#e2dec6] last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">{gift.name}</td>
                  <td className="p-4">R$ {gift.price.toFixed(2)}</td>
                  <td className="p-4">
                    {gift.purchasedQuantity} / {gift.totalQuantity} comprados
                  </td>
                </tr>
              ))}
              {gifts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500 italic">
                    Nenhum presente cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}