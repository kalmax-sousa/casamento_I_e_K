import { useState, useEffect, useRef } from 'react';

// Tipagens baseadas no que o backend retorna
interface Guest {
  id: string;
  name: string;
  isConfirmed: boolean;
  family: Family;
}

interface Family {
  id: string;
  name: string;
  guests: Guest[];
}

// Função mágica para ignorar acentos e letras maiúsculas/minúsculas (João -> joao)
const removeAccents = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export function RSVP() {
  const [inputValue, setInputValue] = useState('');
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [suggestions, setSuggestions] = useState<Guest[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [guestsToConfirm, setGuestsToConfirm] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Carrega TODOS os convidados uma única vez quando a página abre
  useEffect(() => {
    fetchAllGuests();
  }, []);

  const fetchAllGuests = async () => {
      try {
        // Aproveitamos a sua rota de busca mandando um nome vazio para trazer todos
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guests/search?name=`);
        if (response.ok) {
          const data = await response.json();
          setAllGuests(data);
        }
      } catch (error) {
        console.error('Erro ao carregar lista de convidados:', error);
      } finally {
        setIsLoading(false);
      }
    };
  // 2. Filtra a lista localmente conforme a pessoa digita (Autocomplete)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setMessage('');
    setSelectedFamily(null); // Reseta a família se a pessoa voltar a digitar

    if (value.trim().length >= 2) {
      const searchNormalized = removeAccents(value);
      const filtered = allGuests.filter(guest => 
        removeAccents(guest.name).includes(searchNormalized)
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  // 3. Quando clica em um nome no dropdown
  const handleSelectGuest = (guest: Guest) => {
    setInputValue(guest.name);
    setShowDropdown(false);
    
    // Pula a etapa de "Selecionar família" e já exibe os membros direto
    setSelectedFamily(guest.family);
    
    // Facilidade: Já marca automaticamente o checkbox da pessoa que ela buscou
    if (!guest.isConfirmed) {
      setGuestsToConfirm(new Set([guest.id]));
    } else {
      setGuestsToConfirm(new Set());
    }
  };

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lida com o checkbox de cada convidado
  const toggleGuest = (guestId: string) => {
    setGuestsToConfirm((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(guestId)) newSet.delete(guestId);
      else newSet.add(guestId);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/guests/confirm`, {
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
        setInputValue('');
        setGuestsToConfirm(new Set());
        fetchAllGuests();
      }
    } catch (error) {
      console.error(error);
      setMessage('Erro ao confirmar presença. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-paper pt-12 pb-24 px-4 font-serif">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl italic text-textMain mb-4">Confirmação de Presença</h1>
          <p className="text-sm tracking-widest uppercase text-gray-500 max-w-lg mx-auto leading-relaxed">
            Confirme sua presença e a de seus acompanhantes até o dia 17 de setembro.
          </p>
        </div>

        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md font-serif">
          
          {/* Container Relativo para o Dropdown funcionar */}
          <div className="mb-6 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-2 text-gray-700">Digite seu nome ou sobrenome</label>
            
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              disabled={isLoading}
              className="border border-gray-300 p-3 w-full rounded focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={isLoading ? "Carregando lista de convidados..." : "Ex: João Silva"}
              autoComplete="off"
            />

            {/* O Dropdown flutuante */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((guest) => (
                  <li
                    key={guest.id}
                    onClick={() => handleSelectGuest(guest)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <span className="block font-medium">{guest.name}</span>
                    {/*<span className="block text-xs text-gray-400">Grupo: {guest.family.name}</span>*/}
                  </li>
                ))}
              </ul>
            )}
            
            {showDropdown && suggestions.length === 0 && inputValue.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg p-4 text-sm text-gray-500 text-center">
                Nenhum convidado encontrado.
              </div>
            )}
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded text-center font-medium ${message.includes('sucesso') ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
              {message}
            </div>
          )}

          {/* Seleção de Membros da Família */}
          {selectedFamily && (
            <div className="mt-6 border-t border-gray-200 pt-6 animate-fadeIn">
              <div className="mb-4">
                <p className="text-sm text-gray-500">Selecione quem irá comparecer com você:</p>
              </div>
              
              <div className="space-y-3 mb-6">
                {selectedFamily.guests.map((guest) => (
                  console.log(selectedFamily),
                  <label 
                    key={guest.id} 
                    className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${guest.isConfirmed ? 'bg-gray-50' : 'hover:bg-blue-50/50'}`}
                  >
                    <input
                      type="checkbox"
                      disabled={guest.isConfirmed}
                      checked={guest.isConfirmed || guestsToConfirm.has(guest.id)}
                      onChange={() => toggleGuest(guest.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className={guest.isConfirmed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                      {guest.name} {guest.isConfirmed && '(Já confirmado)'}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedFamily(null);
                    setInputValue('');
                  }}
                  className="px-4 py-3 border border-gray-300 text-gray-600 rounded w-1/3 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-4 py-3 bg-blue-600 text-white rounded w-2/3 font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    
  );
}