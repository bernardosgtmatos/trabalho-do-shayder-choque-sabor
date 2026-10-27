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

interface ProdutosResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  produtos: Produto[];
}

function AdminProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [recarregar, setRecarregar] = useState(0);
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    api.get<ProdutosResponse>('/Admin/Produtos', {
      params: { page, limit: PAGE_SIZE },
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
  }, [page, recarregar, navigate]);

  async function handleExcluir(id: string) {
    if (!window.confirm('Deseja realmente excluir este produto?')) return;
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

  return (
    <div className="admin-produtos">
      <div className="admin-produtos-title-bar">
        <span>Produtos Cadastrados</span>
      </div>

      <div className="admin-produtos-acoes">
        <button
          type="button"
          className="admin-produtos-voltar"
          onClick={() => navigate('/admin/novo-produto')}
        >
          Novo produto
        </button>
        <button
          type="button"
          className="admin-produtos-voltar"
          onClick={() => navigate('/admin/nova-categoria')}
        >
          Nova categoria
        </button>
        <button
          type="button"
          className="admin-produtos-voltar"
          onClick={() => navigate('/admin/pedidos')}
        >
          Pedidos
        </button>
      </div>

      {carregando ? (
        <p className="admin-produtos-info">Carregando produtos...</p>
      ) : erro ? (
        <div className="admin-produtos-erro-box">
          <p className="mensagem erro">{erro}</p>
          <button
            type="button"
            className="admin-produtos-voltar"
            onClick={() => { setCarregando(true); setErro(''); setRecarregar((v) => v + 1); }}
          >
            Tentar Novamente
          </button>
        </div>
      ) : produtos.length === 0 ? (
        <div className="admin-produtos-vazio">
          <p>Nenhum produto cadastrado ainda.</p>
          <button
            type="button"
            className="admin-produtos-voltar"
            onClick={() => navigate('/admin/novo-produto')}
          >
            Cadastrar produto
          </button>
        </div>
      ) : (
        <>
          <div className="admin-produtos-lista">
            {produtos.map((produto) => (
            <div key={produto.id} className="admin-produtos-card">
              <div className="admin-produtos-card-imagem">
                {produto.imageUrl ? (
                  <img src={produto.imageUrl} alt={produto.nome} />
                ) : (
                  <span>Sem imagem</span>
                )}
              </div>
              <div className="admin-produtos-card-info">
                <h3>{produto.nome}</h3>
                <p>{produto.descrição}</p>
                <span>Categoria: {produto.categoria}</span>
                <span className="admin-produtos-preco">
                  R$ {Number(produto.valor).toFixed(2)}
                </span>
              </div>
              <div className="admin-produtos-card-acoes">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/produtos/${produto.id}/editar`)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(produto.id)}
                  disabled={excluindo === produto.id}
                >
                  {excluindo === produto.id ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="admin-produtos-resumo">
          Página {page} de {totalPages} • {total} {total === 1 ? 'produto' : 'produtos'}
        </p>
        <div className="admin-produtos-paginacao">
          <button
            type="button"
            className="admin-produtos-voltar"
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
            className="admin-produtos-voltar"
            onClick={handleProxima}
            disabled={page >= totalPages}
          >
            Próxima
          </button>
        </div>
        </>
      )}
    </div>
  );
}

export default AdminProdutos;
