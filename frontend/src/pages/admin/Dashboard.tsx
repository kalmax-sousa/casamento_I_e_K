import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-paper p-8 font-serif text-textMain">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-[#e2dec6] pb-4">
          <h1 className="text-3xl italic">Painel de Controle</h1>
          <button onClick={handleLogout} className="text-red-600 tracking-widest text-sm uppercase hover:underline">
            Sair
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            onClick={() => navigate('/admin/presentes')}
            className="bg-white p-8 rounded-lg shadow-sm border border-[#e2dec6] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-olive/10 text-olive rounded-full flex items-center justify-center mb-4 text-2xl">
              🎁
            </div>
            <h2 className="text-2xl italic mb-2">Lista de Presentes</h2>
            <p className="text-sm text-gray-500">Cadastre presentes, edite o estoque e veja quem já te presenteou.</p>
          </div>

          {/* Card Convidados */}
          <div 
            onClick={() => navigate('/admin/convidados')}
            className="bg-white p-8 rounded-lg shadow-sm border border-[#e2dec6] cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-olive/10 text-olive rounded-full flex items-center justify-center mb-4 text-2xl">
              💌
            </div>
            <h2 className="text-2xl italic mb-2">Lista de Convidados</h2>
            <p className="text-sm text-gray-500">Adicione convidados, crie famílias e gerencie o RSVP (Confirmações).</p>
          </div>
        </div>
      </div>
    </div>
  );
}