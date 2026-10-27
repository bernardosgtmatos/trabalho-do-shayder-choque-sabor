import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminNovoProduto.css';

const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

interface Categoria {
  id: string;
  nome: string;
}

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
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
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

  useEffect(() => {
    let ativo = true;
    api.get<Categoria[]>('/Admin/Categorias')
      .then((response) => {
        if (!ativo) return;
        setCategorias(response.data);
        if (response.data.length > 0) {
          setCategoria(response.data[0].nome);
        }
      })
      .catch((error) => {
        if (!ativo) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login');
        }
      })
      .finally(() => {
        if (ativo) setCarregandoCategorias(false);
      });
    return () => {
      ativo = false;
    };
  }, [navigate]);

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
    if (!categoria) {
      setMensagem('Selecione uma categoria!');
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
      form.append('categoria', categoria);
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

  const semCategorias = !carregandoCategorias && categorias.length === 0;

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
              className="form-control"
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
              className="form-control"
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
              className="form-control"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="8.50"
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
            {carregandoCategorias ? (
              <p>Carregando categorias...</p>
            ) : semCategorias ? (
              <p className="mensagem erro">Nenhuma categoria cadastrada. Crie uma abaixo.</p>
            ) : (
              <select
                id="categoria"
                className="form-control"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                required
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
          {semCategorias ? (
            <p className="mensagem erro">
              Nenhuma categoria cadastrada.{' '}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin/nova-categoria')}
              >
                Criar categoria
              </button>
            </p>
          ) : null}
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

        <button type="submit" className="btn btn-primary btn-block" disabled={carregando || semCategorias}>
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
