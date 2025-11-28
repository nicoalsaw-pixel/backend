// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000; // Use a porta fornecida pelo Render

// Conexão com o Banco de Dados PostgreSQL
// Render define a URL completa de conexão na variável de ambiente DATABASE_URL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // O Render requer a configuração de SSL para conexões seguras
  ssl: {
    rejectUnauthorized: false,
  }
});

app.use(cors());

// ... (o restante do seu código permanece o mesmo)

app.listen(port, () => { // Certifique-se de usar a variável 'port' no listen
  console.log(`Servidor rodando na porta ${port}`);
});


app.get('/api/views', async (req, res) => {
  try {
    await pool.query('UPDATE views SET count = count + 1 WHERE id = 1');
    const result = await pool.query('SELECT count FROM views WHERE id = 1');

    // Retorna o JSON que seu script.js espera
    res.json({ views: result.rows[0].count }); 
  } catch (err) {
    console.error('Erro na query do BD', err);
    res.status(500).json({ views: 'Erro' });
  }
});

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});