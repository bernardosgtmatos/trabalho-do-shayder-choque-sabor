import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import './Header.css';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let ativo = true;
    api.get('/Admin/Me')
      .then(() => {
        if (ativo) setIsAdmin(true);
      })
      .catch(() => {
        if (ativo) setIsAdmin(false);
      });
    return () => {
      ativo = false;
    };
  }, [location.pathname]);

  if (isHome) return null;

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">Choque Sabor</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-btn nav-btn-purple">Home</Link>
          <Link to="/cardapio" className="nav-btn nav-btn-purple">Cardápio</Link>
          <Link to="/admin/pedidos" className="nav-btn nav-btn-purple">Pedidos</Link>
          {isAdmin && (
            <Link to="/admin/gerenciamento" className="nav-btn nav-btn-purple">
              Gerenciamento
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
