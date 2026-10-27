import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Pedido from './pages/Pedido/Pedido';
import Cardapio from './pages/Cardapio/Cardapio';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import AdminPedidos from './pages/AdminPedidos/AdminPedidos';
import AdminNovoProduto from './pages/AdminNovoProduto/AdminNovoProduto';
import AdminNovaCategoria from './pages/AdminNovaCategoria/AdminNovaCategoria';
import AdminGerenciamento from './pages/AdminGerenciamento/AdminGerenciamento';
import AdminProdutos from './pages/AdminProdutos/AdminProdutos';
import AdminEditarProduto from './pages/AdminEditarProduto/AdminEditarProduto';
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
          <Route path="/admin/novo-produto" element={<AdminNovoProduto />} />
<Route path="/admin/nova-categoria" element={<AdminNovaCategoria />} />
<Route path="/admin/gerenciamento" element={<AdminGerenciamento />} />
<Route path="/admin/produtos" element={<AdminProdutos />} />
<Route path="/admin/produtos/:id/editar" element={<AdminEditarProduto />} />
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
