import { useState } from 'react';

// Tipagens baseadas no que o backend retorna
interface Guest {
  id: string;
  name: string;
  isConfirmed: boolean;
}

interface Family {
  id: string;
  name: string;
  guests: Guest[];
}

export function RSVP() {
  const [searchName, setSearchName] = useState('');
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [guestsToConfirm, setGuestsToConfirm] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  // Busca os convidados e suas famílias
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSelectedFamily(null);

    try {
      const response = await fetch(`http://localhost:3333/api/guests/search?name=${searchName}`);
      const data = await response.json();
      
      // Como o backend retorna convidados com a família incluída, 
      // extraímos as famílias únicas para listar
      const uniqueFamilies = Array.from(
        new Map(data.map((guest: any) => [guest.family.id, guest.family])).values()
      ) as Family[];

      setFamilies(uniqueFamilies);
      
      if (uniqueFamilies.length === 0) {
        setMessage('Nenhum convidado encontrado com esse nome.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao buscar. Tente novamente.');
    }
  };

  // Lida com o checkbox de cada convidado
  const toggleGuest = (guestId: string) => {
    setGuestsToConfirm((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) {
        newSet.delete(guestId);
      } else {
        newSet.add(guestId);
      }
      return newSet;
    });
  };

  // Envia a confirmação para o backend
  const handleConfirm = async () => {
    if (guestsToConfirm.size === 0) {
      setMessage('Selecione pelo menos uma pessoa para confirmar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/api/guests/confirm', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestIds: Array.from(guestsToConfirm),
          isConfirmed: true,
        }),
      });

      if (response.ok) {
        setMessage('Presença confirmada com sucesso! Esperamos vocês lá.');
        setSelectedFamily(null);
        setFamilies([]);
        setSearchName('');
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao confirmar presença. Tente novamente.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Confirmação de Presença</h2>
      
      {/* Formulário de Busca */}
      <form onSubmit={handleSearch} className="mb-6">
        <label className="block text-sm font-medium mb-2">Digite seu nome ou sobrenome</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border p-2 w-full rounded"
            placeholder="Ex: João Silva"
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Buscar
          </button>
        </div>
      </form>

      {message && <p className="mb-4 text-center font-medium text-blue-600">{message}</p>}

      {/* Lista de Famílias Encontradas */}
      {!selectedFamily && families.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-2">Selecione sua família:</p>
          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => setSelectedFamily(family)}
              className="w-full text-left p-3 border rounded hover:bg-gray-50"
            >
              {family.name}
            </button>
          ))}
        </div>
      )}

      {/* Seleção de Membros para Confirmar */}
      {selectedFamily && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">{selectedFamily.name}</h3>
          <p className="text-sm text-gray-600 mb-4">Selecione quem irá comparecer:</p>
          
          <div className="space-y-3 mb-6">
            {selectedFamily.guests.map((guest) => (
              <label key={guest.id} className="flex items-center gap-3 p-2 border rounded">
                <input
                  type="checkbox"
                  disabled={guest.isConfirmed}
                  checked={guest.isConfirmed || guestsToConfirm.has(guest.id)}
                  onChange={() => toggleGuest(guest.id)}
                  className="w-5 h-5"
                />
                <span className={guest.isConfirmed ? 'text-gray-400 line-through' : ''}>
                  {guest.name} {guest.isConfirmed && '(Já confirmado)'}
                </span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedFamily(null)}
              className="px-4 py-2 border rounded w-1/3"
            >
              Voltar
            </button>
            <button 
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded w-2/3 font-bold"
            >
              Confirmar Selecionados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}