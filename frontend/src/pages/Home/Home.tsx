import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Choque Sabor</h1>
          <p className="hero-subtitle">
            A melhor experiência em pedidos da região
          </p>
          <Link to="/cardapio" className="cta-button">
            Ver Cardápio
          </Link>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <span className="feature-icon">🍔</span>
          <h3>Produtos Frescos</h3>
          <p>Ingredientes selecionados diariamente</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">🚚</span>
          <h3>Entrega Rápida</h3>
          <p>Entregamos com rapidez na sua casa</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⭐</span>
          <h3>Qualidade Garantida</h3>
          <p>Satisfação garantida ou seu dinheiro de volta</p>
        </div>
      </section>

      <section className="about-section">
        <h2>Sobre Nós</h2>
        <p>
          O Choque Sabor nasceu com a paixão de oferecer a melhor experiência
          emdelivery. Nosso compromisso é com a qualidade e a satisfação dos
          nossos clientes.
        </p>
        <Link to="/pedido" className="cta-button secondary">
          Faça seu Pedido
        </Link>
      </section>
    </div>
  );
}

export default Home;
