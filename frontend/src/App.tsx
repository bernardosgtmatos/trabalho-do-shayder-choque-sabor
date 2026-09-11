import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Pedido from './pages/Pedido/Pedido';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pedido" element={<Pedido />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
