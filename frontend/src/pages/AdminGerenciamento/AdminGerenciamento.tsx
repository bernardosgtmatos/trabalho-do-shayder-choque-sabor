import { useNavigate } from 'react-router-dom';
import './AdminGerenciamento.css';

function AdminGerenciamento() {
  const navigate = useNavigate();

  const itens = [
    { label: 'Pedidos', path: '/admin/pedidos', descricao: 'Visualizar pedidos recebidos' },
    { label: 'Produtos', path: '/admin/produtos', descricao: 'Listar, editar e excluir produtos' },
    { label: 'Novo Produto', path: '/admin/novo-produto', descricao: 'Cadastrar novo produto' },
    { label: 'Nova Categoria', path: '/admin/nova-categoria', descricao: 'Cadastrar nova categoria' },
  ];

  return (
    <div className="admin-gerenciamento">
      <div className="admin-gerenciamento-title-bar">
        <span>Gerenciamento da Plataforma</span>
      </div>

      <div className="admin-gerenciamento-lista">
        {itens.map((item) => (
          <button
            key={item.path}
            type="button"
            className="admin-gerenciamento-card"
            onClick={() => navigate(item.path)}
          >
            <h3>{item.label}</h3>
            <p>{item.descricao}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminGerenciamento;
