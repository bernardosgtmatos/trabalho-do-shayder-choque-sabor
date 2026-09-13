import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="home-ellipses">
        <div className="ellipse ellipse-1" />
        <div className="ellipse ellipse-2" />
        <div className="ellipse ellipse-3" />
      </div>
      <h1 className="home-title">Choque Sabor</h1>
      <Link to="/cardapio" className="home-cta">
        Ver Cardápio
      </Link>
    </div>
  );
}

export default Home;
