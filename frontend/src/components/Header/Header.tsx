import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">Choque Sabor</span>
        </Link>

        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/pedido" className="nav-link">Pedir</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
