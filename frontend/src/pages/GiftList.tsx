import { useState, useEffect } from 'react';
import { GiftCard } from '../components/GiftCard';

// Tipagem baseada no nosso schema do Prisma
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


export function GiftList() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Criamos uma função separada para buscar os presentes
  const fetchGifts = () => {
    fetch(import.meta.env.VITE_API_URL+'/api/gifts/')
      .then(res => res.json())
      .then(data => {
        setGifts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

// GiftList.tsx
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('pagamento') === 'sucesso';
    const sessionId = params.get('session_id');

    if (isSuccess && sessionId) {
      // 1. Limpa a URL para o usuário não ficar vendo aqueles códigos feios
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoading(true);

      // 2. Manda o backend verificar e dar baixa
      fetch(`${import.meta.env.VITE_API_URL}/api/gifts/verify-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      .then(res => res.json())
      .then(() => {
        alert('Presente confirmado com sucesso! Muito obrigado pelo carinho! ❤️');
        // 3. Agora sim, busca a lista de presentes atualizada
        fetchGifts();
      })
      .catch(err => {
        console.error('Erro ao verificar pagamento', err);
        fetchGifts(); // Carrega os presentes mesmo se der erro na tela
      });

    } else {
      // Carregamento normal se não for um retorno de compra
      fetchGifts();
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper pt-12 pb-24 px-4 font-serif">
      <div className="max-w-5xl mx-auto">
        
        {/* Cabeçalho da Página */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl italic text-textMain mb-4">Lista de Presentes</h1>
          <p className="text-sm tracking-widest uppercase text-gray-500 max-w-lg mx-auto leading-relaxed">
            Nossa casa já está tomando forma, mas qualquer ajuda para completá-la é muito bem-vinda. Agradecemos o carinho!
          </p>
        </div>

        {/* Grid de Presentes */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 italic">Carregando presentes...</div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 italic">Nenhum presente disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {gifts.map(gift => (
              <GiftCard
                key={gift.id} 
                gift={gift} 
                onGiftUpdated={fetchGifts} // 3. Aqui está a propriedade que estava faltando!
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}