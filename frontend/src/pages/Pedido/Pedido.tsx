import { useState, useEffect } from 'react';
import api from '../../services/api';
import './Pedido.css';

interface Produto {
  id: string;
  nome: string;
  'descrição': string;
  valor: number;
}

interface ItemPedido {
  produto_id: string;
  quatidade: number;
}

function Pedido() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [mensagem, setMensagem] = useState('');
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

  function handleAddItem(produtoId: string) {
    const existing = itens.find(item => item.produto_id === produtoId);

    if (existing) {
      setItens(itens.map(item =>
        item.produto_id === produtoId
          ? { ...item, quatidade: item.quatidade + 1 }
          : item
      ));
    } else {
      setItens([...itens, { produto_id: produtoId, quatidade: 1 }]);
    }
  }

  function handleRemoveItem(produtoId: string) {
    const existing = itens.find(item => item.produto_id === produtoId);

    if (existing && existing.quatidade > 1) {
      setItens(itens.map(item =>
        item.produto_id === produtoId
          ? { ...item, quatidade: item.quatidade - 1 }
          : item
      ));
    } else {
      setItens(itens.filter(item => item.produto_id !== produtoId));
    }
  }

  function getQuantidadeItem(produtoId: string): number {
    const item = itens.find(i => i.produto_id === produtoId);
    return item ? item.quatidade : 0;
  }

  function calcularTotal(): number {
    return itens.reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.produto_id);
      if (produto) {
        return total + (produto.valor * item.quatidade);
      }
      return total;
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (itens.length === 0) {
      setMensagem('Adicione pelo menos um item ao pedido.');
      return;
    }

    const pedido = {
      nome,
      telefone,
      endereço: {
        rua,
        numero,
        bairro,
      },
      itens,
    };

    try {
      const response = await api.post('/Cliente/Pedido', pedido);
      setMensagem(`Pedido realizado com sucesso! ID: ${response.data.Pedido_id}`);
      setNome('');
      setTelefone('');
      setRua('');
      setNumero('');
      setBairro('');
      setItens([]);
    } catch (error) {
      setMensagem('Erro ao realizar pedido. Tente novamente.');
      console.error('Erro:', error);
    }
  }

  return (
    <div className="pedido">
      <h1>Faça seu Pedido</h1>

      <form onSubmit={handleSubmit} className="pedido-form">
        <div className="form-section">
          <h2>Dados Pessoais</h2>
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Endereço de Entrega</h2>
          <div className="form-group">
            <label htmlFor="rua">Rua</label>
            <input
              type="text"
              id="rua"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Nome da rua"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <input
                type="text"
                id="numero"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Nº"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bairro">Bairro</label>
              <input
                type="text"
                id="bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Bairro"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Produtos</h2>
          {carregando ? (
            <p className="mensagem-info">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
            <p className="mensagem-info">Nenhum produto disponível no momento.</p>
          ) : (
            <div className="produtos-list">
              {produtos.map((produto) => (
              <div key={produto.id} className="produto-item">
                <div className="produto-info">
                  <h3>{produto.nome}</h3>
                  <p>{produto['descrição']}</p>
                  <span className="produto-valor">
                    R$ {Number(produto.valor).toFixed(2)}
                  </span>
                </div>
                <div className="produto-controls">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(produto.id)}
                    disabled={getQuantidadeItem(produto.id) === 0}
                  >
                    -
                  </button>
                  <span className="quantidade">{getQuantidadeItem(produto.id)}</span>
                  <button
                    type="button"
                    onClick={() => handleAddItem(produto.id)}
                  >
                    +
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>

        {itens.length > 0 && (
          <div className="pedido-resumo">
            <h2>Resumo do Pedido</h2>
            <div className="resumo-itens">
              {itens.map((item) => {
                const produto = produtos.find(p => p.id === item.produto_id);
                if (!produto) return null;
                return (
                  <div key={item.produto_id} className="resumo-item">
                    <span>{item.quatidade}x {produto.nome}</span>
                    <span>R$ {(produto.valor * item.quatidade).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="resumo-total">
              <strong>Total:</strong>
              <strong>R$ {calcularTotal().toFixed(2)}</strong>
            </div>
          </div>
        )}

        <button type="submit" className="submit-button">
          Finalizar Pedido
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

export default Pedido;
