const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const os = require('os');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

// --- Configuração do Banco de Dados MySQL ---
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

let connection;

async function connectWithRetry() {
  console.log('Tentando conectar ao banco de dados...');
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Conectado ao banco de dados MySQL!');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS produto_marca (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS produto_unidade_venda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS produto (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        valor DECIMAL(10, 2) NOT NULL,
        marca_id INT NOT NULL,
        unidade_venda_id INT NOT NULL,
        FOREIGN KEY (marca_id) REFERENCES produto_marca(id),
        FOREIGN KEY (unidade_venda_id) REFERENCES produto_unidade_venda(id)
      );
    `);
    console.log('Tabelas verificadas/criadas.');

    await connection.execute(`
      INSERT IGNORE INTO produto_marca (nome) VALUES ('Faber-Castell'), ('BIC'), ('Cis');
    `);
    await connection.execute(`
      INSERT IGNORE INTO produto_unidade_venda (tipo) VALUES ('Unidade'), ('Caixa Fechada');
    `);
    console.log('Valores inseridos.');

  } catch (err) {
    console.error('Erro ao conectar ou criar a tabela:', err.message);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

// --- Rotas da API REST ---
app.post('/produtos', async (req, res) => {
    try {
        const { nome, descricao, valor, marca_id, unidade_venda_id } = req.body;
        if (!nome || !valor || !marca_id || !unidade_venda_id) {
            return res.status(400).json({ error: "Nome, valor, marca_id e unidade_venda_id são obrigatórios." });
        }
        
        const [result] = await connection.execute(
            "INSERT INTO produto (nome, descricao, valor, marca_id, unidade_venda_id) VALUES (?, ?, ?, ?, ?)",
            [nome, descricao, valor, marca_id, unidade_venda_id]
        );
        console.log(`Produto cadastrado com ID: ${result.insertId}`);
        res.status(201).json({ id: result.insertId, nome, descricao, valor, marca_id, unidade_venda_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await connection.execute(`
      SELECT
        p.id,
        p.nome,
        p.descricao,
        p.valor,
        m.nome as marca,
        u.tipo as unidade_venda
      FROM produto p
      JOIN produto_marca m ON p.marca_id = m.id
      JOIN produto_unidade_venda u ON p.unidade_venda_id = u.id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/produtos/:id', async (req, res) => {
    try {
        const [rows] = await connection.execute(`
            SELECT
                p.id,
                p.nome,
                p.descricao,
                p.valor,
                e.quantidade as estoque
            FROM produto p
            LEFT JOIN estoque e ON p.id = e.produto_id
            WHERE p.id = ?
        `, [req.params.id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: "Produto não encontrado." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para listar todas as marcas
app.get('/marcas', async (req, res) => {
    try {
        const [rows] = await connection.execute("SELECT id, nome FROM produto_marca");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Listar os tipos de unidade de venda
app.get('/unidades', async (req, res) => {
    try {
        const [rows] = await connection.execute("SELECT id, tipo FROM produto_unidade_venda");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
  console.log(`Microsserviço de Produtos rodando na porta ${port}`);
});