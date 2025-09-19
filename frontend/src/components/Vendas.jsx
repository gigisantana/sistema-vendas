import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [produtoIds, setProdutoIds] = useState([]);

  // Simulamos a requisição para listar as vendas ao carregar o componente
  useEffect(() => {
    // API REST do serviço de vendas (Java)
    axios.get('http://localhost:8080/vendas')
      .then(response => {
        setVendas(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar vendas:', error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const novaVenda = {
      clienteId: clienteId,
      produtoIds: produtoIds.map(id => parseInt(id))
    };

    // Requisição POST para criar uma nova venda
    axios.post('http://localhost:8080/vendas', novaVenda)
      .then(response => {
        setVendas([...vendas, response.data]);
        setClienteId('');
        setProdutoIds([]);
      })
      .catch(error => {
        console.error('Erro ao criar venda:', error);
      });
  };

  return (
    <div>
      <h2>Vendas</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            ID do Cliente:
            <input 
              type="number" 
              value={clienteId} 
              onChange={e => setClienteId(e.target.value)} 
              required 
            />
          </label>
        </div>
        <div>
          <label>
            IDs dos Produtos (separados por vírgula):
            <input 
              type="text" 
              value={produtoIds} 
              onChange={e => setProdutoIds(e.target.value.split(','))} 
              required 
            />
          </label>
        </div>
        <button type="submit">Registrar Venda</button>
      </form>
      <ul>
        {vendas.map(venda => (
          <li key={venda.id}>
            Venda #{venda.id} - Cliente ID: {venda.clienteId}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Vendas;