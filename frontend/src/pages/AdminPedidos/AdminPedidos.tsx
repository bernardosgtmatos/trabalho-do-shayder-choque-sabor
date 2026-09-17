import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './AdminPedidos.css';

// Para mostrar mais pedidos por página, aumente este valor
// (máximo permitido pelo backend: 50).
const PAGE_SIZE = 5;

interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
}

interface Cliente {
  nome: string;
  telefone: string;
  endereço: Endereco;
}

interface ItemPedido {
  produto_id: string;
  nome: string | null;
  quatidade: number;
  valor: number;
}

interface Pedido {
  id: string;
  valortotal: number;
  createdAt: string;
  cliente: Cliente | null;
  itens: ItemPedido[];
}

interface PedidosResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  pedidos: Pedido[];
}

function AdminPedidos() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [recarregar, setRecarregar] = useState(0);

  useEffect(() => {
    let ativo = true;

    api.get<PedidosResponse>('/Admin/Pedidos', {
      params: { page, limit: PAGE_SIZE },
    })
      .then((response) => {
        if (!ativo) return;
        setPedidos(response.data.pedidos);
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
        console.error('Erro ao buscar pedidos:', error);
        setErro('Erro ao carregar pedidos. Tente novamente.');
        setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [page, recarregar, navigate]);

  function prepararTrocaDePagina() {
    setCarregando(true);
    setErro('');
  }

  function handleAnterior() {
    if (page > 1) {
      prepararTrocaDePagina();
      setPage(page - 1);
    }
  }

  function handleProxima() {
    if (page < totalPages) {
      prepararTrocaDePagina();
      setPage(page + 1);
    }
  }

  function handleAtualizar() {
    prepararTrocaDePagina();
    setPage(1);
    setRecarregar((v) => v + 1);
  }

  return (
    <div className="admin-pedidos">
      <div className="admin-pedidos-title-bar">
        <span>Pedidos Recebidos</span>
      </div>

      <div className="admin-pedidos-acoes">
        <button
          type="button"
          className="admin-pedidos-voltar"
          onClick={() => navigate('/admin/novo-produto')}
        >
          Novo produto
        </button>
      </div>

      {carregando ? (
        <p className="admin-pedidos-info">Carregando pedidos...</p>
      ) : erro ? (
        <div className="admin-pedidos-erro-box">
          <p className="mensagem erro">{erro}</p>
          <button type="button" className="admin-pedidos-voltar" onClick={handleAtualizar}>
            Tentar Novamente
          </button>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="admin-pedidos-vazio">
          <p>Nenhum pedido recebido ainda.</p>
          <button type="button" className="admin-pedidos-voltar" onClick={handleAtualizar}>
            Atualizar
          </button>
        </div>
      ) : (
        <>
          <p className="admin-pedidos-resumo">
            Página {page} de {totalPages} • {total} {total === 1 ? 'pedido' : 'pedidos'}
          </p>

          <div className="admin-pedidos-lista">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="admin-pedidos-card">
                <div className="admin-pedidos-card-header">
                  <span className="admin-pedidos-data">
                    {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                  </span>
                  <span className="admin-pedidos-total">
                    R$ {Number(pedido.valortotal).toFixed(2)}
                  </span>
                </div>

                <div className="form-section">
                  <h2>Cliente</h2>
                  {pedido.cliente ? (
                    <div className="admin-pedidos-cliente">
                      <p><strong>{pedido.cliente.nome}</strong></p>
                      <p>{pedido.cliente.telefone}</p>
                      <p>
                        {pedido.cliente.endereço.rua}, {pedido.cliente.endereço.numero} - {pedido.cliente.endereço.bairro}
                      </p>
                    </div>
                  ) : (
                    <p className="admin-pedidos-cliente">Cliente não informado.</p>
                  )}
                </div>

                <div className="form-section">
                  <h2>Itens</h2>
                  <div className="admin-pedidos-itens">
                    {pedido.itens.map((item) => (
                      <div key={item.produto_id} className="admin-pedidos-item">
                        <span className="admin-pedidos-item-nome">{item.nome || 'Produto removido'}</span>
                        <span className="admin-pedidos-item-qtd">{item.quatidade}x</span>
                        <span className="admin-pedidos-item-preco">
                          R$ {(Number(item.valor) * Number(item.quatidade)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-pedidos-paginacao">
            <button
              type="button"
              className="admin-pedidos-voltar"
              onClick={handleAnterior}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span className="admin-pedidos-pagina">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="admin-pedidos-voltar"
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

export default AdminPedidos;
