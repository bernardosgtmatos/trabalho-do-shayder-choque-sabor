import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Cardapio.css';

interface Produto {
  id: string;
  nome: string;
  'descrição': string;
  valor: number;
  imageUrl?: string | null;
}

interface ItemSelecionado {
  produto_id: string;
  quatidade: number;
}

function Cardapio() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<ItemSelecionado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/Cliente/Produtos')
      .then((response) => {
        setProdutos(response.data);
        setCarregando(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos:', error);
        setCarregando(false);
      });
  }, []);

  function getQuantidade(produtoId: string): number {
    const item = itens.find(i => i.produto_id === produtoId);
    return item ? item.quatidade : 0;
  }

  function handleAdd(produtoId: string) {
    const existing = itens.find(i => i.produto_id === produtoId);
    if (existing) {
      setItens(itens.map(i =>
        i.produto_id === produtoId
          ? { ...i, quatidade: i.quatidade + 1 }
          : i
      ));
    } else {
      setItens([...itens, { produto_id: produtoId, quatidade: 1 }]);
    }
  }

  function handleRemove(produtoId: string) {
    const existing = itens.find(i => i.produto_id === produtoId);
    if (existing && existing.quatidade > 1) {
      setItens(itens.map(i =>
        i.produto_id === produtoId
          ? { ...i, quatidade: i.quatidade - 1 }
          : i
      ));
    } else {
      setItens(itens.filter(i => i.produto_id !== produtoId));
    }
  }

  function handleFazerPedido() {
    const itensComProduto = itens.map(item => {
      const produto = produtos.find(p => p.id === item.produto_id);
      return { ...item, nome: produto?.nome || '', valor: produto?.valor || 0 };
    });
    navigate('/pedido', { state: { itens: itensComProduto } });
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quatidade, 0);

  return (
    <div className="cardapio">
      <div className="cardapio-title-bar">
        <span>Cardápio - escolha seu pedido</span>
      </div>

      {carregando ? (
        <p className="cardapio-info">Carregando cardápio...</p>
      ) : produtos.length === 0 ? (
        <p className="cardapio-info">Nenhum produto disponível no momento.</p>
      ) : (
        <>
          <div className="cardapio-grid">
            {produtos.map((produto) => {
              const qtd = getQuantidade(produto.id);
              return (
                <div key={produto.id} className={`cardapio-card ${qtd > 0 ? 'selecionado' : ''}`}>
                  <div className="cardapio-card-imagem">
                    {produto.imageUrl ? (
                      <img
                        src={produto.imageUrl}
                        alt={produto.nome}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="cardapio-card-placeholder">
                        Imagem do produto
                      </span>
                    )}
                  </div>
                  <div className="cardapio-card-info">
                    <h3>{produto.nome}</h3>
                    <p>{produto['descrição']}</p>
                    <span className="cardapio-card-preco">
                      R$ {Number(produto.valor).toFixed(2)}
                    </span>
                  </div>
                  <div className="cardapio-card-controls">
                    <button
                      type="button"
                      onClick={() => handleRemove(produto.id)}
                      disabled={qtd === 0}
                    >
                      -
                    </button>
                    <span className="cardapio-qtd">{qtd}</span>
                    <button
                      type="button"
                      onClick={() => handleAdd(produto.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalItens > 0 && (
            <button
              type="button"
              className="cardapio-fazer-pedido"
              onClick={handleFazerPedido}
            >
              Fazer Pedido ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Cardapio;
