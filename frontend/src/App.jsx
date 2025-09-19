import { useState } from 'react'
import Produtos from './components/Produtos'
import Clientes from './components/Clientes'
import Vendas from './components/Vendas'
import './App.css'

function App() {
  return (
    <>
      <h1>Sistema de Vendas</h1>
      <div style={{ display: 'flex', gap: '2rem' }}>
        <Produtos />
        <Clientes />
        <Vendas />
      </div>
    </>
  )
}

export default App