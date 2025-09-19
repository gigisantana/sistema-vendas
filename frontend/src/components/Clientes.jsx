import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [showCadastro, setShowCadastro] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: '', sobrenome: '', telefone: '' });
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = (termo = '') => {
    axios.get(`http://localhost:50052/clientes?nome=${termo}`)
      .then(response => {
        setClientes(response.data);
      })
      .catch(error => {
        console.error('Erro ao buscar clientes:', error);
      });
  };

  const handleSearch = () => {
    fetchClientes(termoBusca);
  };

  const handleCadastro = (e) => {
    e.preventDefault();
    axios.post('http://localhost:50052/clientes', novoCliente)
      .then(() => {
        setNovoCliente({ nome: '', sobrenome: '', telefone: '' });
        setShowCadastro(false);
        fetchClientes();
      })
      .catch(error => {
        console.error('Erro ao cadastrar cliente:', error);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovoCliente({ ...novoCliente, [name]: value });
  };

  return (
    <div>
      <h2>Clientes</h2>
      <button onClick={() => setShowCadastro(!showCadastro)}>
        {showCadastro ? 'Voltar para a Busca' : 'Cadastrar Cliente'}
      </button>

      {showCadastro ? (
        <form onSubmit={handleCadastro}>
          <input type="text" name="nome" placeholder="Nome" value={novoCliente.nome} onChange={handleInputChange} required />
          <input type="text" name="sobrenome" placeholder="Sobrenome" value={novoCliente.sobrenome} onChange={handleInputChange} required />
          <input type="text" name="telefone" placeholder="Telefone" value={novoCliente.telefone} onChange={handleInputChange} required />
          <button type="submit">Salvar</button>
        </form>
      ) : (
        <>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Buscar por nome" 
              value={termoBusca} 
              onChange={e => setTermoBusca(e.target.value)} 
            />
            <button onClick={handleSearch}>Buscar</button>
          </div>
          <ul>
            {clientes.map(cliente => (
              <li key={cliente.id}>
                {cliente.nome} {cliente.sobrenome} - {cliente.telefone}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Clientes;