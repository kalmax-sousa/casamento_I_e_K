import { Link, Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header / Menu de Navegação */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-serif font-bold text-gray-800">
            I & K
          </Link>
          
          <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-600">
            <Link to="/" className="hover:text-black">Início</Link>
            <Link to="/infos" className="hover:text-black">Informações</Link>
            <Link to="/presentes" className="hover:text-black">Lista de Presentes</Link>
            <Link to="/fotos" className="hover:text-black">Desafio de Fotos</Link>
            <Link to="/rsvp" className="hover:text-black border-b-2 border-transparent hover:border-black">
              Confirmar Presença
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo dinâmico das páginas entra aqui */}
      <main className="w-full">
        <Outlet />
      </main>

      {/* Footer simples */}
      <footer className="text-center py-8 text-sm text-gray-400">
        Feito com ❤️ pelos noivos.
      </footer>
    </div>
  );
}