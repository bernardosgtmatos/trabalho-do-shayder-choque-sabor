import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminNovoProduto.css';

const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | string | undefined;
    if (typeof data === 'string' && data) return data;
    if (data && typeof data === 'object' && data.error) return data.error;
    if (error.response?.status === 413) return 'Imagem muito grande (máximo 5MB).';
    if (error.message === 'Network Error') return 'Erro de rede. Verifique se o backend está rodando.';
  }
  return 'Erro ao cadastrar produto. Tente novamente.';
}

function AdminNovoProduto() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleImagemChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setMensagem('');
    setSucesso(false);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    if (!file) {
      setImagem(null);
      return;
    }
    if (!TIPOS_ACEITOS.includes(file.type)) {
      setMensagem('Tipo de imagem inválido. Use JPEG, PNG, WEBP ou SVG.');
      setImagem(null);
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGEM_BYTES) {
      setMensagem('Imagem muito grande. Máximo 5MB.');
      setImagem(null);
      e.target.value = '';
      return;
    }
    setImagem(file);
    setPreview(URL.createObjectURL(file));
  }

  function limparFormulario() {
    setNome('');
    setDescricao('');
    setValor('');
    setImagem(null);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem('');
    setSucesso(false);

    const valorNumero = Number(valor.replace(',', '.'));
    if (!nome.trim() || !descricao.trim() || !valor.trim()) {
      setMensagem('Todos os campos devem ser preenchidos!');
      return;
    }
    if (!Number.isFinite(valorNumero) || valorNumero <= 0) {
      setMensagem('Valor deve ser um número maior que zero.');
      return;
    }
    if (!imagem) {
      setMensagem('Imagem do produto é obrigatória!');
      return;
    }

    setCarregando(true);
    try {
      const form = new FormData();
      form.append('nome', nome.trim());
      form.append('descrição', descricao.trim());
      form.append('valor', String(valorNumero.toFixed(2)));
      form.append('imagem', imagem);

      await api.post('/Admin/NovoProduto', form);
      setMensagem('Produto adicionado com sucesso!');
      setSucesso(true);
      limparFormulario();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      setMensagem(extrairMensagemErro(error));
      console.error('Erro ao cadastrar produto:', error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="admin-novo-produto">
      <div className="admin-novo-produto-title-bar">
        <span>Novo Produto</span>
      </div>

      <form onSubmit={handleSubmit} className="admin-novo-produto-form">
        <div className="form-section">
          <h2>Dados do Produto</h2>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Coxinha de frango"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o produto"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="valor">Valor (R$)</label>
            <input
              type="number"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="8.50"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="imagem">Imagem (JPEG, PNG, WEBP ou SVG — máx. 5MB)</label>
            <input
              type="file"
              id="imagem"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleImagemChange}
              required
            />
          </div>
          {preview && (
            <div className="preview">
              <img src={preview} alt="Pré-visualização do produto" />
            </div>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Cadastrar produto'}
        </button>
      </form>

      {mensagem && (
        <div className={`mensagem ${sucesso ? 'sucesso' : 'erro'}`}>{mensagem}</div>
      )}
    </div>
  );
}

export default AdminNovoProduto;
