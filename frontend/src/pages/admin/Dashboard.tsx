import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

// Tipos baseados no que o Prisma retorna
type Guest = { id: string; name: string; isConfirmed: boolean };
type Family = { id: string; name: string; guests: Guest[] };

export function AdminDashboard() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newGuestNames, setNewGuestNames] = useState(''); // Separados por vírgula
  const navigate = useNavigate();

  // Busca inicial das famílias
  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      const response = await api.fetchAuth('/admin/families');
      const data = await response.json();
      setFamilies(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    // Pega a string "Joao, Maria, Jose" e transforma no array ["Joao", "Maria", "Jose"]
    const guestNamesArray = newGuestNames.split(',').map(n => n.trim()).filter(n => n);

    if (guestNamesArray.length === 0) return alert('Adicione pelo menos um convidado.');

    try {
      await api.fetchAuth('/admin/families', {
        method: 'POST',
        body: JSON.stringify({ familyName: newFamilyName, guestNames: guestNamesArray })
      });
      setNewFamilyName('');
      setNewGuestNames('');
      loadFamilies(); // Recarrega a lista
    } catch (error) {
      alert('Erro ao criar família');
    }
  };

  const toggleConfirm = async (guest: Guest) => {
    try {
      await api.fetchAuth(`/admin/guests/${guest.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isConfirmed: !guest.isConfirmed })
      });
      loadFamilies(); // Forma simples de atualizar a tela (poderia atualizar o estado local para ser mais rápido)
    } catch (error) {
      alert('Erro ao alterar status');
    }
  };

  const deleteFamily = async (familyId: string) => {
    if (!window.confirm('Tem certeza que quer apagar essa família inteira?')) return;
    try {
      await api.fetchAuth(`/admin/families/${familyId}`, { method: 'DELETE' });
      loadFamilies();
    } catch (error) {
      alert('Erro ao deletar família');
    }
  };

  const deleteGuest = async (guestId: string) => {
    if (!window.confirm('Remover este convidado?')) return;
    try {
      await api.fetchAuth(`/admin/guests/${guestId}`, { method: 'DELETE' });
      loadFamilies();
    } catch (error) {
      alert('Erro ao deletar convidado');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Painel de Convidados</h1>
          <button onClick={handleLogout} className="text-red-600 hover:underline">Sair</button>
        </div>

        {/* Formulário para adicionar nova família */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Adicionar Família</h2>
          <form onSubmit={handleCreateFamily} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Nome do Grupo/Família</label>
              <input
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="Ex: Família Silva"
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="flex-[2]">
              <label className="block text-sm text-gray-600 mb-1">Convidados (separe por vírgula)</label>
              <input
                value={newGuestNames}
                onChange={(e) => setNewGuestNames(e.target.value)}
                placeholder="Ex: João, Maria, Pedrinho"
                className="w-full border rounded p-2"
                required
              />
            </div>
            <button type="submit" className="bg-black text-white px-6 py-2 rounded">
              Salvar
            </button>
          </form>
        </div>

        {/* Lista de Famílias */}
        <div className="space-y-6">
          {families.map(family => (
            <div key={family.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-gray-800">{family.name}</h3>
                <button 
                  onClick={() => deleteFamily(family.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Excluir Família
                </button>
              </div>
              
              <div className="space-y-2">
                {family.guests.map(guest => (
                  <div key={guest.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className={guest.isConfirmed ? 'font-medium text-green-700' : 'text-gray-600'}>
                      {guest.name}
                    </span>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleConfirm(guest)}
                        className={`text-sm px-3 py-1 rounded ${guest.isConfirmed ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}
                      >
                        {guest.isConfirmed ? 'Confirmado' : 'Pendente'}
                      </button>
                      <button 
                        onClick={() => deleteGuest(guest.id)}
                        className="text-red-400 hover:text-red-600 font-bold"
                        title="Remover convidado"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}