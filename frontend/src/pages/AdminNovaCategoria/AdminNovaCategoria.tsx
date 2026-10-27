import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminNovaCategoria.css';

function AdminNovaCategoria() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setSucesso(false);

    if (!nome.trim()) {
      setMensagem('O nome da categoria é obrigatório.');
      return;
    }

    setCarregando(true);
    try {
      await api.post('/Admin/NovaCategoria', { nome: nome.trim() });
      setMensagem('Categoria criada com sucesso!');
      setSucesso(true);
      setNome('');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      console.error('Erro ao criar categoria:', error);
      const data = axios.isAxiosError(error) ? error.response?.data : undefined;
      const msg = typeof data === 'string' ? data : (data as { error?: string } | undefined)?.error;
      setMensagem(msg || 'Erro ao criar categoria. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="admin-nova-categoria">
      <div className="admin-nova-categoria-title-bar">
        <span>Nova Categoria</span>
      </div>

      <form onSubmit={handleSubmit} className="admin-nova-categoria-form">
        <div className="form-section">
          <h2>Dados da Categoria</h2>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Salgados"
              className="form-control"
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Criar categoria'}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ marginTop: '10px' }}
          onClick={() => navigate('/admin/produtos')}
        >
          Voltar
        </button>
      </form>

      {mensagem && (
        <div className={`mensagem ${sucesso ? 'sucesso' : 'erro'}`}>{mensagem}</div>
      )}
    </div>
  );
}

export default AdminNovaCategoria;
