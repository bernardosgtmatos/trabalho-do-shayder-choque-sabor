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
  const [errors, setErrors] = useState<{ email?: string; senha?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; senha?: boolean }>({});

  useEffect(() => {
    api.get('/Admin/Pedidos', { params: { page: 1, limit: 1 } })
      .then(() => navigate('/admin/pedidos'))
      .catch(() => {});
  }, [navigate]);

  function validate() {
    const next: { email?: string; senha?: string } = {};
    if (!email.trim()) next.email = 'E-mail é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'E-mail inválido.';
    if (!senha) next.senha = 'Senha é obrigatória.';
    return next;
  }

  function handleBlur(field: 'email' | 'senha') {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    const nextErrors = validate();
    setErrors(nextErrors);
    setTouched({ email: true, senha: true });
    if (Object.keys(nextErrors).length > 0) return;
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

  const isValid = Object.keys(validate()).length === 0;

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
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="email@loja.com"
              required
            />
            {touched.email && errors.email && <span className="field-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              className="form-control"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onBlur={() => handleBlur('senha')}
              placeholder="Sua senha"
              required
            />
            {touched.senha && errors.senha && <span className="field-error">{errors.senha}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={carregando || !isValid}>
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
