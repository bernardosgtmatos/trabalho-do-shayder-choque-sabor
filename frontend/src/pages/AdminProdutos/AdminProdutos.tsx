import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminProdutos.css';

const PAGE_SIZE = 8;

interface Produto {
  id: string;
  nome: string;
  descrição: string;
  valor: number;
  categoria: string;
  imageUrl: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface ProdutosResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  produtos: Produto[];
}

type Ordenacao = 'recentes' | 'nome' | 'preco';

function AdminProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [recarregar, setRecarregar] = useState(0);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recentes');

  useEffect(() => {
    let ativo = true;
    api.get<Categoria[]>('/Admin/Categorias')
      .then((response) => {
        if (!ativo) return;
        setCategorias(response.data);
      })
      .catch(() => {
        // Filtro de categoria segue opcional mesmo se falhar.
      });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    let ativo = true;
    api.get<ProdutosResponse>('/Admin/Produtos', {
      params: {
        page,
        limit: PAGE_SIZE,
        search: busca.trim() || undefined,
        categoria: categoriaFiltro || undefined,
        sort: ordenacao,
        order: ordenacao === 'nome' ? 'asc' : 'desc',
      },
    })
      .then((response) => {
        if (!ativo) return;
        setProdutos(response.data.produtos);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
        setCarregando(false);
      })
      .catch((error) => {
        if (!ativo) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          navigate('/admin/login');
          return;
        }
        console.error('Erro ao buscar produtos:', error);
        setErro('Erro ao carregar produtos. Tente novamente.');
        setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [page, recarregar, busca, categoriaFiltro, ordenacao, navigate]);

  function abrirConfirmacao(id: string) {
    setConfirmId(id);
  }

  function fecharConfirmacao() {
    setConfirmId(null);
  }

  async function confirmarExclusao() {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    setExcluindo(id);
    try {
      await api.delete(`/Admin/Produtos/${id}`);
      setRecarregar((v) => v + 1);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        navigate('/admin/login');
        return;
      }
      console.error('Erro ao excluir produto:', error);
      const data = axios.isAxiosError(error) ? error.response?.data : undefined;
      const msg = typeof data === 'string' ? data : (data as { error?: string } | undefined)?.error;
      setErro(msg || 'Erro ao excluir produto.');
    } finally {
      setExcluindo(null);
    }
  }

  function handleAnterior() {
    if (page > 1) {
      setCarregando(true);
      setErro('');
      setPage(page - 1);
    }
  }

  function handleProxima() {
    if (page < totalPages) {
      setCarregando(true);
      setErro('');
      setPage(page + 1);
    }
  }

  function limparFiltros() {
    setCarregando(true);
    setErro('');
    setBusca('');
    setCategoriaFiltro('');
    setOrdenacao('recentes');
    setPage(1);
  }

  const filtrosAtivos = busca.trim() !== '' || categoriaFiltro !== '' || ordenacao !== 'recentes';

  return (
    <div className="admin-produtos">
      <div className="admin-produtos-title-bar">
        <span>Produtos Cadastrados</span>
      </div>

      <div className="admin-produtos-toolbar">
        <div className="admin-produtos-filtros">
          <input
            type="search"
            className="admin-produtos-busca"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => {
              setCarregando(true);
              setErro('');
              setBusca(e.target.value);
              setPage(1);
            }}
            aria-label="Buscar produto por nome"
          />
          <select
            className="admin-produtos-select"
            value={categoriaFiltro}
            onChange={(e) => {
              setCarregando(true);
              setErro('');
              setCategoriaFiltro(e.target.value);
              setPage(1);
            }}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.nome}>
                {c.nome}
              </option>
            ))}
          </select>
          <select
            className="admin-produtos-select"
            value={ordenacao}
            onChange={(e) => {
              setCarregando(true);
              setErro('');
              setOrdenacao(e.target.value as Ordenacao);
              setPage(1);
            }}
            aria-label="Ordenar produtos"
          >
            <option value="recentes">Mais recentes</option>
            <option value="nome">Nome (A-Z)</option>
            <option value="preco">Menor preço</option>
          </select>
          {filtrosAtivos && (
            <button type="button" className="btn btn-ghost" onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>
        <div className="admin-produtos-acoes">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/admin/novo-produto')}
          >
            Novo produto
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/admin/nova-categoria')}
          >
            Nova categoria
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/admin/pedidos')}
          >
            Pedidos
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setCarregando(true);
              setErro('');
              setRecarregar((v) => v + 1);
            }}
            disabled={carregando}
          >
            Atualizar
          </button>
        </div>
      </div>

      {carregando ? (
        <div className="admin-produtos-skeleton-grid" aria-busy="true" aria-label="Carregando produtos">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="admin-produtos-skeleton-card">
              <div className="skeleton skeleton-imagem" />
              <div className="skeleton skeleton-linha" />
              <div className="skeleton skeleton-linha curta" />
              <div className="skeleton skeleton-linha media" />
            </div>
          ))}
        </div>
      ) : erro ? (
        <div className="admin-produtos-erro-box">
          <p className="mensagem erro">{erro}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { setCarregando(true); setErro(''); setRecarregar((v) => v + 1); }}
          >
            Tentar Novamente
          </button>
        </div>
      ) : produtos.length === 0 ? (
        <div className="admin-produtos-vazio">
          <div className="admin-produtos-vazio-icone" aria-hidden="true">📦</div>
          <p>
            {filtrosAtivos
              ? 'Nenhum produto encontrado para os filtros aplicados.'
              : 'Nenhum produto cadastrado ainda.'}
          </p>
          {filtrosAtivos ? (
            <button type="button" className="btn btn-primary" onClick={limparFiltros}>
              Limpar filtros
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/admin/novo-produto')}
            >
              Cadastrar produto
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="admin-produtos-resumo">
            Mostrando {total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total}{' '}
            {total === 1 ? 'produto' : 'produtos'} • Página {page} de {totalPages}
          </p>
          <div className="admin-produtos-lista">
            {produtos.map((produto) => (
              <article key={produto.id} className="admin-produtos-card">
                <div className="admin-produtos-card-imagem">
                  {produto.imageUrl ? (
                    <img src={produto.imageUrl} alt={produto.nome} loading="lazy" />
                  ) : (
                    <span>Sem imagem</span>
                  )}
                </div>
                <div className="admin-produtos-card-body">
                  <h3>{produto.nome}</h3>
                  <p>{produto.descrição}</p>
                  <div className="admin-produtos-card-meta">
                    <span className="badge">{produto.categoria}</span>
                    <span className="admin-produtos-preco">
                      R$ {Number(produto.valor).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="admin-produtos-card-acoes">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate(`/admin/produtos/${produto.id}/editar`)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => abrirConfirmacao(produto.id)}
                    disabled={excluindo === produto.id}
                  >
                    {excluindo === produto.id ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="admin-produtos-paginacao">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAnterior}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span className="admin-produtos-pagina">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleProxima}
              disabled={page >= totalPages}
            >
              Próxima
            </button>
          </div>
        </>
      )}
      {confirmId && (
        <div className="admin-produtos-modal-overlay" onClick={fecharConfirmacao}>
          <div
            className="admin-produtos-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmar-exclusao-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="confirmar-exclusao-titulo">Confirmar exclusão</h3>
            <p>Deseja realmente excluir este produto? Esta ação não pode ser desfeita.</p>
            <div className="admin-produtos-modal-acoes">
              <button type="button" className="btn btn-ghost" onClick={fecharConfirmacao}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmarExclusao}
                disabled={excluindo === confirmId}
              >
                {excluindo === confirmId ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProdutos;
