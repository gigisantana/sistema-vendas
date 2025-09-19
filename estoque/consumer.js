const amqp = require('amqplib');
const mysql = require('mysql2/promise');
const os = require('os');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

let connection;

async function connectToDbWithRetry() {
  while (true) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('Conexão com o banco de dados MySQL estabelecida.');
      return;
    } catch (err) {
      console.error('Erro ao conectar ao banco de dados, tentando novamente em 5s:', err.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

async function connectToRabbitMQWithRetry() {
  while (true) {
    try {
      const conn = await amqp.connect('amqp://rabbitmq');
      console.log('Conexão com o RabbitMQ estabelecida.');
      return conn;
    } catch (err) {
      console.error('Erro ao conectar ao RabbitMQ, tentando novamente em 5s:', err.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// --- Lógica do Consumidor de Mensagens ---
async function startConsumer() {
  await connectToDbWithRetry(); // Espera o banco de dados
  const conn = await connectToRabbitMQWithRetry(); // Espera o RabbitMQ
  const channel = await conn.createChannel();
  const queueName = 'vendas_pendentes';

  await channel.assertQueue(queueName, { durable: true });
  console.log(`[*] Aguardando mensagens na fila: ${queueName}`);

  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        const vendaData = JSON.parse(msg.content.toString());
        console.log(`Recebida nova venda: ${JSON.stringify(vendaData)}`);

        const produtoId = vendaData.produtoIds[0];
        const quantidadeVenda = 1;

        const [rows] = await connection.execute('SELECT quantidade FROM estoque WHERE produto_id = ?', [produtoId]);

        if (rows.length > 0 && rows[0].quantidade >= quantidadeVenda) {
          await connection.execute('UPDATE estoque SET quantidade = quantidade - ? WHERE produto_id = ?', [quantidadeVenda, produtoId]);
          console.log(`Estoque atualizado para o produto ${produtoId}. Venda processada.`);
        } else {
          console.log(`Estoque insuficiente para o produto ${produtoId}. Venda cancelada.`);
        }
        channel.ack(msg);
      } catch (error) {
        console.error(`Erro ao processar mensagem: ${error.message}`);
        channel.nack(msg);
      }
    }
  }, { noAck: false });
}

startConsumer();