import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import Produtos from './components/Produtos'
import Clientes from './components/Clientes'
import Vendas from './components/Vendas'
import './App.css'

function Home() {
  return (
    <>
      <h1>Sistema de Vendas</h1>
      <p>Bem-vindo ao painel de gerenciamento de vendas da sua papelaria online.</p>
    </>
  );
}

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |
        <Link to="/produtos"> Produtos</Link> |
        <Link to="/clientes"> Clientes</Link> |
        <Link to="/vendas"> Vendas</Link>
      </nav>

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/vendas" element={<Vendas />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App