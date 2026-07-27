import { useState, useEffect } from 'react';

// Tipagem baseada no nosso schema do Prisma
interface Gift {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  price: number;
  totalQuantity: number;
  purchasedQuantity: number;
}

// Sub-componente para isolar a lógica e o estado (quantidade) de cada presente
function GiftCard({ gift, onGiftUpdated }: { gift: Gift, onGiftUpdated: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const available = gift.totalQuantity - gift.purchasedQuantity;
  const isSoldOut = available <= 0;

  // Opção 1: Comprar pelo site (Stripe)
  const handleStripeCheckout = async () => {
    if (!buyerName.trim()) return alert('Por favor, informe seu nome.');
    setIsProcessing(true);
    try {
      const response = await fetch('https://casamento-i-e-k.onrender.com/api/gifts/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: gift.id, quantityToBuy: quantity, buyerName }),
      });
      const data = await response.json();
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else alert(data.error || 'Erro ao processar.');
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Opção 2: Marcar que comprou por fora
  const handleExternalPurchase = async () => {
    if (!buyerName.trim()) return alert('Por favor, informe seu nome.');
    setIsProcessing(true);
    try {
      const response = await fetch('https://casamento-i-e-k.onrender.com/api/gifts/pledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: gift.id, quantityToBuy: quantity, buyerName }),
      });
      if (response.ok) {
        alert('Presente confirmado com sucesso! Muito obrigado(a)!');
        setShowModal(false);
        onGiftUpdated(); // Atualiza a lista para mostrar a nova quantidade
      } else {
        const data = await response.json();
        alert(data.error || 'Erro ao registrar.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* O Card do Presente */}
      <div className="bg-white rounded-lg shadow-sm border border-[#e2dec6] overflow-hidden flex flex-col transition-transform hover:-translate-y-1">
        <div className="aspect-square bg-paper relative flex items-center justify-center overflow-hidden">
          {gift.photoUrl ? (
            <img src={gift.photoUrl} alt={gift.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-textMain text-white px-4 py-2 text-xs tracking-widest uppercase rounded-full">Esgotado</span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow text-center">
          <h3 className="text-xl italic text-textMain mb-2">{gift.name}</h3>
          {gift.description && <p className="text-sm text-gray-500 mb-4 flex-grow">{gift.description}</p>}
          
          <div className="mt-auto">
            <p className="text-lg font-semibold text-textMain mb-4">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}
            </p>

            {!isSoldOut && (
              <button 
                onClick={() => setShowModal(true)}
                className="w-full bg-olive text-white tracking-widest text-xs uppercase py-3 px-4 rounded-full transition-colors hover:bg-opacity-90"
              >
                Presentear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up (Modal) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">✕</button>
            
            <h2 className="text-2xl italic text-textMain mb-2 text-center">Você escolheu: {gift.name}</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Como você prefere nos presentear?</p>

            <div className="mb-6">
              <label className="block text-sm text-gray-600 mb-1">Seu Nome (Para sabermos quem deu) *</label>
              <input 
                type="text" 
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Ex: Tio João e Tia Maria"
                className="w-full border border-[#e2dec6] rounded p-3 focus:outline-none focus:border-olive"
              />
            </div>

            {available > 1 && (
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-1">Quantidade</label>
                <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border border-[#e2dec6] rounded p-3 focus:outline-none focus:border-olive">
                  {Array.from({ length: available }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleStripeCheckout} disabled={isProcessing} className="w-full bg-olive text-white tracking-widest text-xs uppercase py-4 rounded transition-colors hover:bg-opacity-90 disabled:opacity-50">
                Pagar com Cartão (Pelo Site)
              </button>
              
              <button onClick={handleExternalPurchase} disabled={isProcessing} className="w-full border border-olive text-olive tracking-widest text-xs uppercase py-4 rounded transition-colors hover:bg-paper disabled:opacity-50">
                Vou comprar em outra loja
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function GiftList() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Criamos uma função separada para buscar os presentes
  const fetchGifts = () => {
    fetch('https://casamento-i-e-k.onrender.com/api/gifts')
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

  // 2. Chamamos a função quando a tela carrega pela primeira vez
  useEffect(() => {
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