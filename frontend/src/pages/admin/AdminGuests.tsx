import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

type Guest = { id: string; name: string; isConfirmed: boolean };
type Family = { id: string; name: string; guests: Guest[] };

export function AdminGuests() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  
  // Form State
  const [familyName, setFamilyName] = useState('');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const response = await api.fetchAuth('/admin/families');
      setFamilies(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !familyName.trim()) return alert('Preencha os dois campos!');

    try {
      await api.fetchAuth('/admin/guestFamily', {
        method: 'POST',
        body: JSON.stringify({ 
          familyName: familyName.trim(), 
          guestName: guestName.trim()
        })
      });
      setGuestName('');
      setFamilyName('');
      // Mantemos o familyName preenchido para facilitar adicionar várias pessoas na mesma família
      loadFamilies();
    } catch (error) {
      alert('Erro ao cadastrar convidado');
    }
  };

  const toggleConfirm = async (guest: Guest) => {
    try {
      await api.fetchAuth(`/admin/guests/${guest.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isConfirmed: !guest.isConfirmed })
      });
      loadFamilies();
    } catch (error) {
      alert('Erro ao alterar status');
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!window.confirm('Remover este convidado?')) return;
    try {
      await api.fetchAuth(`/admin/guests/${guestId}`, { method: 'DELETE' });
      loadFamilies();
    } catch (error) {
      alert('Erro ao deletar');
    }
  };

  // Transforma as famílias separadas em uma única lista gigante de convidados
  const allGuests = families.flatMap(family => 
    family.guests.map(guest => ({ ...guest, familyName: family.name }))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-serif text-textMain">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#e2dec6] pb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-800">← Voltar</button>
            <h1 className="text-3xl italic">Lista de Convidados</h1>
          </div>
        </div>

        {/* Formulário Único */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#e2dec6] mb-8">
          <h2 className="text-xl mb-4 italic">Cadastrar Convidado</h2>
          <form onSubmit={handleCreateGuest} className="flex flex-col md:flex-row gap-4 items-end">
            
            <div className="flex-[2]">
              <label className="block text-sm text-gray-600 mb-1">Nome do Convidado *</label>
              <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Ex: João da Silva" className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" required />
            </div>

            <div className="flex-[2]">
              <label className="block text-sm text-gray-600 mb-1">Família / Grupo *</label>
              <input 
                value={familyName} 
                onChange={(e) => setFamilyName(e.target.value)} 
                placeholder="Ex: Família Silva ou Amigos da Faculdade" 
                className="w-full border border-[#e2dec6] rounded p-2 focus:outline-none focus:border-olive" 
                required 
                list="family-list" // Isso faz o navegador sugerir as famílias que já existem!
              />
              <datalist id="family-list">
                {families.map(f => <option key={f.id} value={f.name} />)}
              </datalist>
            </div>

            <button type="submit" className="bg-olive text-white tracking-widest text-xs uppercase px-6 py-3 rounded hover:bg-opacity-90">
              Adicionar
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2">Dica: Se você digitar uma família que já existe, ele adiciona o convidado nela automaticamente.</p>
        </div>

        {/* Tabela Única de Convidados */}
        <div className="bg-white rounded-lg shadow-sm border border-[#e2dec6] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-paper border-b border-[#e2dec6] text-xs tracking-widest uppercase text-gray-500">
              <tr>
                <th className="p-4">Convidado</th>
                <th className="p-4">Família</th>
                <th className="p-4">Status de Presença</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {allGuests.map(guest => (
                <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-semibold">{guest.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{guest.familyName}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => toggleConfirm(guest)}
                      className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider ${guest.isConfirmed ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                    >
                      {guest.isConfirmed ? 'Confirmado' : 'Pendente'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteGuest(guest.id)} className="text-red-400 hover:text-red-600 text-xl font-bold" title="Remover convidado">×</button>
                  </td>
                </tr>
              ))}
              {allGuests.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic">Nenhum convidado cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}