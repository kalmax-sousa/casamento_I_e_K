import { useState } from 'react';

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

type PaymentMethod = 'CARD' | 'PIX_MANUAL' | 'EXTERNAL' | null;

export function GiftCard({ gift, onGiftUpdated }: { gift: Gift, onGiftUpdated: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<PaymentMethod>(null);
  
  const quantity = 1;
  const [buyerName, setBuyerName] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const available = gift.totalQuantity - gift.purchasedQuantity;
  const isSoldOut = available <= 0;

  // Sua chave PIX real vai aqui
  const pixKey = "00020126330014BR.GOV.BCB.PIX0111078711183075204000053039865802BR5923KALMAX DOS SANTOS SOUSA6012QUIXERAMOBIM62070503***63040CC5"; 

  const handleOpenModal = () => {
    setStep(1);
    setMethod(null);
    setBuyerName('');
    setMessage('');
    setShowModal(true);
  };

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!buyerName.trim()) return alert('Por favor, informe seu nome.');
    setIsProcessing(true);

    try {
      if (method === 'CARD') {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gifts/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giftId: gift.id, quantityToBuy: quantity, buyerName, message }),
        });
        const data = await res.json();
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
        else alert(data.error || 'Erro ao processar.');
        
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gifts/manual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ giftId: gift.id, quantityToBuy: quantity, buyerName, message, method }),
        });
        
        if (res.ok) {
          alert('Presente confirmado com sucesso! Muito obrigado pelo carinho!');
          setShowModal(false);
          onGiftUpdated();
        } else {
          const data = await res.json();
          alert(data.error || 'Erro ao registrar.');
        }
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    alert('Chave PIX copiada!');
  };

  return (
    <>
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
          <p className="text-lg font-semibold text-textMain mb-4">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}
          </p>

          {!isSoldOut && (
            <button 
              onClick={handleOpenModal}
              className="mt-auto w-full bg-olive text-white tracking-widest text-xs uppercase py-3 px-4 rounded-full transition-colors hover:bg-opacity-90"
            >
              Presentear
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-xl">✕</button>
            
            <h2 className="text-2xl italic text-textMain mb-2 text-center">{gift.name}</h2>
            
            {step === 1 && (
              <div className="mt-6 flex flex-col gap-3">
                <p className="text-sm text-gray-500 text-center mb-4">Como você prefere nos presentear?</p>
                
                <button onClick={() => handleMethodSelect('PIX_MANUAL')} className="w-full border-2 border-olive text-olive font-semibold py-4 rounded transition-colors hover:bg-olive hover:text-white">
                  Fazer um PIX
                </button>
                <button onClick={() => handleMethodSelect('CARD')} className="w-full bg-gray-100 text-gray-700 font-semibold py-4 rounded transition-colors hover:bg-gray-200">
                  Pagar com Cartão
                </button>
                <button onClick={() => handleMethodSelect('EXTERNAL')} className="w-full text-gray-500 text-sm py-2 underline mt-2 hover:text-gray-800">
                  Prefiro comprar na loja e entregar
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="mt-4 animate-fadeIn">
                <button onClick={() => setStep(1)} className="text-sm text-gray-400 mb-4 hover:text-gray-700">← Voltar</button>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Seu Nome *</label>
                    <input 
                      type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full border border-[#e2dec6] rounded p-3 focus:outline-none focus:border-olive"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mensagem para os Noivos (Opcional)</label>
                    <textarea 
                      value={message} onChange={(e) => setMessage(e.target.value)}
                      rows={2} placeholder="Deixe seu carinho aqui..."
                      className="w-full border border-[#e2dec6] rounded p-3 focus:outline-none focus:border-olive resize-none"
                    />
                  </div>
                </div>

                {method === 'PIX_MANUAL' && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center mb-6 border border-gray-200">
                    <p className="text-sm font-semibold mb-2">Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gift.price)}</p>
                    <img src="" alt="QR Code PIX" className="w-40 h-40 mx-auto mb-4 bg-white p-2 rounded shadow-sm" />
                    <button onClick={copyPixKey} className="text-sm text-olive underline mb-2">Copiar Chave PIX</button>
                    <p className="text-xs text-gray-500 mt-2">Faça o pagamento no seu banco e depois clique no botão abaixo para confirmar.</p>
                  </div>
                )}

                {method === 'EXTERNAL' && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                    <h4 className="font-semibold text-sm mb-2">Detalhes do Presente:</h4>
                    <p className="text-sm text-gray-600 mb-4">{gift.specifications || 'Nenhuma especificação especial.'}</p>
                    
                    {gift.storeLinks && gift.storeLinks.length > 0 && (
                      <>
                        <h4 className="font-semibold text-sm mb-2">Onde encontrar:</h4>
                        <ul className="text-sm space-y-2">
                          {gift.storeLinks.map((link, i) => (
                            <li key={i}>
                              <a href={link} target="_blank" rel="noreferrer" className="p-1 inline-block bg-olive text-white rounded hover:bg-opacity-90 transition-colors">
                                Link da Loja {i + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleSubmit} 
                  disabled={isProcessing} 
                  className="w-full bg-olive text-white tracking-widest text-xs uppercase py-4 rounded transition-colors hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isProcessing ? 'Processando...' : 
                   method === 'CARD' ? 'Ir para Pagamento' : 
                   method === 'PIX_MANUAL' ? 'Já fiz o PIX!' : 
                   'Confirmar Presente'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}