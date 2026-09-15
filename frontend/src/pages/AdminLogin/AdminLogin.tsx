import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    api.get('/Admin/Pedidos', { params: { page: 1, limit: 1 } })
      .then(() => navigate('/admin/pedidos'))
      .catch(() => {});
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      await api.post('/Admin/login', { email, senha });
      setMensagem('Login realizado com sucesso!');
      navigate('/admin/pedidos');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setMensagem('Credenciais inválidas. Verifique email e senha.');
      } else {
        setMensagem('Erro ao fazer login. Tente novamente.');
      }
      console.error('Erro no login:', error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-title-bar">
        <span>Área do Dono — Login</span>
      </div>

      <form onSubmit={handleSubmit} className="admin-login-form">
        <div className="form-section">
          <h2>Acesso da Loja</h2>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@loja.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {mensagem && (
        <div className={`mensagem ${mensagem.includes('sucesso') ? 'sucesso' : 'erro'}`}>
          {mensagem}
        </div>
      )}
    </div>
  );
}

export default AdminLogin;
