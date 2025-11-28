// server.js - Versão CORRETA e Final (Apenas código do servidor)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
// Use a porta fornecida pelo Render
const port = process.env.PORT || 3000; 

// Conexão com o Banco de Dados PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Configuração de SSL necessária para conexões seguras no Render
  ssl: {
    rejectUnauthorized: false,
  }
});

app.use(cors());

// ==========================================================
// ROTA: CONTADOR DE VIEWS ÚNICAS (/api/views)
// ==========================================================
app.get('/api/views', async (req, res) => {
    // 1. Obtém o IP real do cliente.
    const clientIp = req.header('x-forwarded-for') || req.socket.remoteAddress;

    const client = await pool.connect();
    let isNewView = false;
    
    try {
        // 2. Tenta inserir o IP na tabela visited_ips
        const ipInsertResult = await client.query(
            'INSERT INTO visited_ips (ip_address) VALUES ($1) ON CONFLICT (ip_address) DO NOTHING RETURNING ip_address',
            [clientIp]
        );
        
        // 3. Verifica se o IP é novo
        if (ipInsertResult.rowCount > 0) {
            // 4. Se for novo, incrementa o contador principal
            await client.query('UPDATE views SET count = count + 1 WHERE id = 1');
            isNewView = true;
        }
        
        // 5. Busca o valor atualizado do contador
        const result = await client.query('SELECT count FROM views WHERE id = 1');
        
        // 6. Retorna a resposta
        res.json({ 
            views: result.rows[0].count,
            message: isNewView ? "View única contabilizada." : "IP já registrado. View não contabilizada."
        }); 

    } catch (err) {
        console.error('Erro na query do BD', err);
        res.status(500).json({ views: 'Erro na API' });
    } finally {
        // 7. Libera o cliente de volta para o pool
        client.release();
    }
});

// ==========================================================
// INICIA O SERVIDOR
// ==========================================================
app.listen(port, () => { 
  console.log(`Servidor rodando na porta ${port}`);
});