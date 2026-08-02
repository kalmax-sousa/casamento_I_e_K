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

 useEffect(() => {
    if (window.location.search.includes('pagamento=sucesso')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    fetchGifts();
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
          <div className="flex items-center justify-center gap-4 mt-8 text-[#c4bca2]">
            <span className="h-[1px] w-12 bg-[#e2dec6]" />
            <span>⋈</span>
            <span className="h-[1px] w-12 bg-[#e2dec6]" />
          </div>
        </div>

        {/* Grid de Presentes */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-500 italic">Carregando presentes...</div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 italic">Nenhum presente disponível no momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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