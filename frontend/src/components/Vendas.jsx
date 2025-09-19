import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [produtoId, setProdutoId] = useState('');
  const [estoqueAtual, setEstoqueAtual] = useState(0);
  const [valorProduto, setValorProduto] = useState(0);
  const [termoBuscaCliente, setTermoBuscaCliente] = useState('');

  useEffect(() => {
    fetchVendas();
    fetchProdutos();
  }, []);

  useEffect(() => {
    if (termoBuscaCliente.length > 2) {
      fetchClientes(termoBuscaCliente);
    } else {
      setClientes([]);
    }
  }, [termoBuscaCliente]);

  useEffect(() => {
    if (produtoId) {
      axios.get(`http://localhost:3001/produtos/${produtoId}`)
        .then(response => {
          setEstoqueAtual(response.data.estoque || 0);
          setValorProduto(response.data.valor);
        })
        .catch(error => {
          console.error('Erro ao buscar detalhes do produto:', error);
        });
    } else {
      setEstoqueAtual(0);
      setValorProduto(0);
    }
  }, [produtoId]);

  const fetchVendas = () => {
    axios.get('http://localhost:8080/vendas')
      .then(response => {
        setVendas(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar vendas:', error);
      });
  };

  const fetchProdutos = () => {
    axios.get('http://localhost:3001/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
      });
  };

  const fetchClientes = (termo) => {
    axios.get(`http://localhost:50052/clientes?nome=${termo}`)
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar clientes:', error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novaVenda = {
      clienteId: parseInt(clienteId),
      produtoIds: [parseInt(produtoId)]
    };
    
    axios.post('http://localhost:8080/vendas', novaVenda)
      .then(response => {
        alert(response.data);
        fetchVendas();
      })
      .catch(error => {
        console.error('Erro ao registrar venda:', error);
      });
  };

  return (
    <div>
      <h2>Registrar Venda</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Cliente:
            <input 
              type="text" 
              placeholder="Buscar cliente por nome" 
              value={termoBuscaCliente} 
              onChange={e => setTermoBuscaCliente(e.target.value)} 
            />
            {clientes.length > 0 && (
              <select onChange={e => setClienteId(e.target.value)} required>
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.sobrenome}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>
        <div className="form-group">
          <label>
            Produto:
            <select onChange={e => setProdutoId(e.target.value)} required>
              <option value="">Selecione um produto</option>
              {produtos.map(produto => (
                <option key={produto.id} value={produto.id}>
                  {produto.nome}
                </option>
              ))}
            </select>
          </label>
          <p>Estoque: {estoqueAtual}</p>
          <p>Valor: R${valorProduto.toFixed(2)}</p>
        </div>
        <button type="submit">Vender</button>
      </form>
      <h3>Histórico de Vendas</h3>
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