import React, { useState, useEffect } from 'react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    // Simulação da requisição gRPC
    const mockClients = [
      { id: 1, nome: 'Maria', sobrenome: 'Santos', telefone: '98888-8888' },
      { id: 2, nome: 'Carlos', sobrenome: 'Oliveira', telefone: '97777-7777' },
    ];
    setClientes(mockClients);
  }, []);

  return (
    <div>
      <h2>Clientes</h2>
      <ul>
        {clientes.map(cliente => (
          <li key={cliente.id}>
            {cliente.nome} {cliente.sobrenome} - {cliente.telefone}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clientes;