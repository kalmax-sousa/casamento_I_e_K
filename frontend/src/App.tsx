import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { RSVP } from './pages/RSPV';
import type { JSX } from 'react/jsx-runtime';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminLogin } from './pages/admin/Login';
import { Home } from './pages/Home';
import { AdminGifts } from './pages/admin/AdminGifts';
import { GiftList } from './pages/GiftList';
import { AdminGuests } from './pages/admin/AdminGuests';

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
          path="/admin/"  
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/admin/convidados" 
          element={
            <PrivateRoute>
              <AdminGuests />
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