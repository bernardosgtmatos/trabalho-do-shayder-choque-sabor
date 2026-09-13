import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Pedido.css';

interface ItemRecebido {
  produto_id: string;
  quatidade: number;
  nome: string;
  valor: number;
}

interface PedidoState {
  itens: ItemRecebido[];
}

function Pedido() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PedidoState | null;
  const itens = state?.itens || [];

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [mensagem, setMensagem] = useState('');

  function calcularTotal(): number {
    return itens.reduce((total, item) => total + (item.valor * item.quatidade), 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (itens.length === 0) {
      setMensagem('Nenhum item no pedido. Volte ao cardápio.');
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
      itens: itens.map(i => ({
        produto_id: i.produto_id,
        quatidade: i.quatidade,
      })),
    };

    try {
      const response = await api.post('/Cliente/Pedido', pedido);
      setMensagem(`Pedido realizado com sucesso! ID: ${response.data.Pedido_id}`);
      setNome('');
      setTelefone('');
      setRua('');
      setNumero('');
      setBairro('');
    } catch (error) {
      setMensagem('Erro ao realizar pedido. Tente novamente.');
      console.error('Erro:', error);
    }
  }

  if (itens.length === 0) {
    return (
      <div className="pedido">
        <div className="pedido-title-bar">
          <span>Faça seu Pedido</span>
        </div>
        <div className="pedido-vazio">
          <p>Nenhum item selecionado.</p>
          <button type="button" className="pedido-voltar" onClick={() => navigate('/cardapio')}>
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido">
      <div className="pedido-title-bar">
        <span>Faça seu Pedido</span>
      </div>

      <form onSubmit={handleSubmit} className="pedido-form">
        <div className="form-section">
          <h2>Itens do Pedido</h2>
          <div className="pedido-itens">
            {itens.map((item) => (
              <div key={item.produto_id} className="pedido-item">
                <span className="pedido-item-nome">{item.nome}</span>
                <span className="pedido-item-qtd">{item.quatidade}x</span>
                <span className="pedido-item-preco">R$ {(item.valor * item.quatidade).toFixed(2)}</span>
              </div>
            ))}
            <div className="pedido-total">
              <strong>Total:</strong>
              <strong>R$ {calcularTotal().toFixed(2)}</strong>
            </div>
          </div>
        </div>

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
