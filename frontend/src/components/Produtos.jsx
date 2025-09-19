import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    // Faz a requisição para a API REST do microsserviço de produtos
    axios.get('http://localhost:3001/produtos')
      .then(response => {
        setProdutos(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar produtos:', error);
      });
  }, []);

  return (
    <div>
      <h2>Produtos</h2>
      <ul>
        {produtos.map(produto => (
          <li key={produto.id}>
            {produto.nome} - R${produto.valor.toFixed(2)} ({produto.marca})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Produtos;