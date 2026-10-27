import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminEditarProduto.css';

const MAX_IMAGEM_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

interface Categoria {
  id: string;
  nome: string;
}

interface Produto {
  id: string;
  nome: string;
  descrição: string;
  valor: number;
  categoria: string;
  imageUrl: string;
}

function extrairMensagemErro(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | string | undefined;
    if (typeof data === 'string' && data) return data;
    if (data && typeof data === 'object' && data.error) return data.error;
    if (error.response?.status === 413) return 'Imagem muito grande (máximo 5MB).';
    if (error.message === 'Network Error') return 'Erro de rede. Verifique se o backend está rodando.';
  }
  return 'Erro ao atualizar produto. Tente novamente.';
}

function AdminEditarProduto() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [imagem, setImagem] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (!id) return;
    let ativo = true;
    Promise.all([
      api.get<Produto>(`/Admin/Produtos/${id}`),
      api.get<Categoria[]>('/Admin/Categorias'),
    ])
      .then(([prodRes, catRes]) => {
        if (!ativo) return;
        const p = prodRes.data;
        setNome(p.nome);
        setDescricao(p.descrição);
        setValor(String(p.valor));
        setCategoria(p.categoria);
        setImagemAtual(p.imageUrl || null);
        setCategorias(catRes.data);
        setCarregandoDados(false);
      })
      .catch((error) => {
        if (!ativo) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login');
          return;
        }
        console.error('Erro ao carregar produto:', error);
        setMensagem('Erro ao carregar produto.');
        setCarregandoDados(false);
      });
    return () => {
      ativo = false;
    };
  }, [id, navigate]);

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

    setCarregando(true);
    try {
      const form = new FormData();
      form.append('nome', nome.trim());
      form.append('descrição', descricao.trim());
      form.append('valor', String(valorNumero.toFixed(2)));
      form.append('categoria', categoria);
      if (imagem) form.append('imagem', imagem);

      await api.put(`/Admin/Produtos/${id}`, form);
      setMensagem('Produto atualizado com sucesso!');
      setSucesso(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      setMensagem(extrairMensagemErro(error));
      console.error('Erro ao atualizar produto:', error);
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoDados) {
    return (
      <div className="admin-editar-produto">
        <p>Carregando produto...</p>
      </div>
    );
  }

  return (
    <div className="admin-editar-produto">
      <div className="admin-editar-produto-title-bar">
        <span>Editar Produto</span>
      </div>

      <form onSubmit={handleSubmit} className="admin-editar-produto-form">
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
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoria</label>
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
          </div>
          <div className="form-group">
            <label htmlFor="imagem">Nova imagem (opcional)</label>
            <input
              type="file"
              id="imagem"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleImagemChange}
            />
          </div>
          {(preview || imagemAtual) && (
            <div className="preview">
              <img
                src={preview || imagemAtual || ''}
                alt="Pré-visualização do produto"
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar alterações'}
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

export default AdminEditarProduto;
