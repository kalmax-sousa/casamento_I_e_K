import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { RSVP } from './components/RSPV';
import type { JSX } from 'react/jsx-runtime';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminLogin } from './pages/admin/Login';
import { Home } from './pages/Home';
import { GiftList } from './pages/GiftList';
import { AdminGifts } from './pages/admin/AdminGifts';

// Componentes provisórios (Placeholders) para as páginas
const Info = () => <div>Informações (Cardápio, Vestimenta)</div>;
const PhotoChallenge = () => <div>Desafio de Fotos</div>;

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas (Usam o MainLayout com o Menu) */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="infos" element={<Info />} />
          <Route path="presentes" element={<GiftList />} />
          <Route path="fotos" element={<PhotoChallenge />} />
          
          {/* O componente RSVP que fizemos entra aqui */}
          <Route path="rsvp" element={<RSVP />} /> 
        </Route>

        {/* Rotas Administrativas */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* Rota Administrativa (Fora do layout principal para não ter o menu dos convidados) */}
        <Route 
          path="/admin/dashboard"  
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/admin/presentes" 
          element={
            <PrivateRoute>
              <AdminGifts />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}