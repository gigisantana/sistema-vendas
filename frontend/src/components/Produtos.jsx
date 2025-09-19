import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [novoProduto, setNovoProduto] = useState({ nome: '', descricao: '', valor: '', marcaId: '', unidadeVendaId: '' });

  useEffect(() => {
    fetchProdutos();
    fetchMarcas();
    fetchUnidades();
  }, []);

  const fetchProdutos = () => {
    axios.get('http://localhost:3001/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
      });
  };

  const fetchMarcas = () => {
    axios.get('http://localhost:3001/marcas')
      .then(response => {
        setMarcas(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar marcas:', error);
      });
  };

  const fetchUnidades = () => {
    axios.get('http://localhost:3001/unidades')
      .then(response => {
        setUnidades(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar unidades de venda:', error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoProduto({ ...novoProduto, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/produtos', novoProduto)
      .then(() => {
        setNovoProduto({ nome: '', descricao: '', valor: '', marcaId: '', unidadeVendaId: '' });
        fetchProdutos();
      })
      .catch(error => {
        console.error('Erro ao cadastrar produto:', error);
      });
  };

  return (
    <div>
      <h2>Produtos</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nome" placeholder="Nome" value={novoProduto.nome} onChange={handleInputChange} required />
        <input type="text" name="descricao" placeholder="Descrição" value={novoProduto.descricao} onChange={handleInputChange} />
        <input type="number" name="valor" placeholder="Valor" value={novoProduto.valor} onChange={handleInputChange} required />
        
        <select name="marcaId" value={novoProduto.marcaId} onChange={handleInputChange} required>
          <option value="">Selecione a Marca</option>
          {marcas.map(marca => (
            <option key={marca.id} value={marca.id}>{marca.nome}</option>
          ))}
        </select>
        
        <select name="unidadeVendaId" value={novoProduto.unidadeVendaId} onChange={handleInputChange} required>
          <option value="">Selecione a Unidade de Venda</option>
          {unidades.map(unidade => (
            <option key={unidade.id} value={unidade.id}>{unidade.tipo}</option>
          ))}
        </select>
        
        <button type="submit">Cadastrar</button>
      </form>
      <ul>
        {produtos.map(produto => (
          <li key={produto.id}>{produto.nome} - R${produto.valor.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Produtos;