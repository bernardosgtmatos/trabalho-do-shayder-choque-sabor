import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Pedido from './pages/Pedido/Pedido';
import Cardapio from './pages/Cardapio/Cardapio';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminPedidos from './pages/AdminPedidos/AdminPedidos';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cardapio" element={<Cardapio />} />
          <Route path="/pedido" element={<Pedido />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/pedidos" element={<AdminPedidos />} />
        </Routes>
      </main>
      {!isHome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
