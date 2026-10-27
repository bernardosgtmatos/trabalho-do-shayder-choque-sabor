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
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string; rua?: string; numero?: string; bairro?: string }>({});
  const [touched, setTouched] = useState<{ nome?: boolean; telefone?: boolean; rua?: boolean; numero?: boolean; bairro?: boolean }>({});

  function calcularTotal(): number {
    return itens.reduce((total, item) => total + (item.valor * item.quatidade), 0);
  }

  function validate() {
    const next: { nome?: string; telefone?: string; rua?: string; numero?: string; bairro?: string } = {};
    if (!nome.trim()) next.nome = 'Nome é obrigatório.';
    if (!telefone.trim()) next.telefone = 'Telefone é obrigatório.';
    if (!rua.trim()) next.rua = 'Rua é obrigatória.';
    if (!numero.trim()) next.numero = 'Número é obrigatório.';
    if (!bairro.trim()) next.bairro = 'Bairro é obrigatório.';
    return next;
  }

  function handleBlur(field: 'nome' | 'telefone' | 'rua' | 'numero' | 'bairro') {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);
    setTouched({ nome: true, telefone: true, rua: true, numero: true, bairro: true });
    if (Object.keys(nextErrors).length > 0) {
      setMensagem('Corrija os campos destacados.');
      return;
    }

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

  const isValid = Object.keys(validate()).length === 0;

  if (itens.length === 0) {
    return (
      <div className="pedido">
        <div className="pedido-title-bar">
          <span>Faça seu Pedido</span>
        </div>
        <div className="pedido-vazio">
          <p>Nenhum item selecionado.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/cardapio')}>
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
              className="form-control"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onBlur={() => handleBlur('nome')}
              placeholder="Seu nome completo"
              required
            />
            {touched.nome && errors.nome && <span className="field-error">{errors.nome}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              className="form-control"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              onBlur={() => handleBlur('telefone')}
              placeholder="(11) 99999-9999"
              required
            />
            {touched.telefone && errors.telefone && <span className="field-error">{errors.telefone}</span>}
          </div>
        </div>

        <div className="form-section">
          <h2>Endereço de Entrega</h2>
          <div className="form-group">
            <label htmlFor="rua">Rua</label>
            <input
              type="text"
              id="rua"
              className="form-control"
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              onBlur={() => handleBlur('rua')}
              placeholder="Nome da rua"
              required
            />
            {touched.rua && errors.rua && <span className="field-error">{errors.rua}</span>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <input
                type="text"
                id="numero"
              className="form-control"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                onBlur={() => handleBlur('numero')}
                placeholder="Nº"
                required
              />
              {touched.numero && errors.numero && <span className="field-error">{errors.numero}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="bairro">Bairro</label>
              <input
                type="text"
                id="bairro"
              className="form-control"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                onBlur={() => handleBlur('bairro')}
                placeholder="Bairro"
                required
              />
              {touched.bairro && errors.bairro && <span className="field-error">{errors.bairro}</span>}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={!isValid}>
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
