// server.js - Código corrigido com lógica de IP único
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
    // 1. Obtém o IP real do cliente. O Render usa o cabeçalho 'x-forwarded-for'.
    const clientIp = req.header('x-forwarded-for') || req.socket.remoteAddress;

    const client = await pool.connect();
    let isNewView = false;
    
    try {
        // 2. Tenta inserir o IP na tabela visited_ips
        // Se o IP já existir (ON CONFLICT), ele não faz nada (DO NOTHING).
        const ipInsertResult = await client.query(
            'INSERT INTO visited_ips (ip_address) VALUES ($1) ON CONFLICT (ip_address) DO NOTHING RETURNING ip_address',
            [clientIp]
        );
        
        // 3. Verifica se o IP foi inserido (rowCount > 0 significa que é um IP novo)
        if (ipInsertResult.rowCount > 0) {
            // 4. Se o IP for novo, incrementa o contador principal
            await client.query('UPDATE views SET count = count + 1 WHERE id = 1');
            isNewView = true;
        }
        
        // 5. Busca o valor atualizado do contador
        const result = await client.query('SELECT count FROM views WHERE id = 1');
        
        // 6. Retorna a resposta
        res.json({ 
            views: result.rows[0].count,
            // A mensagem de debug é opcional, mas útil para confirmar a lógica
            message: isNewView ? "View única contabilizada." : "IP já registrado. View não contabilizada."
        }); 

    } catch (err) {
        console.error('Erro na query do BD', err);
        // Em caso de erro (ex: tabela não existe), retorna 500
        res.status(500).json({ views: 'Erro na API' });
    } finally {
        // 7. Libera o cliente de volta para o pool de conexões
        client.release();
    }
});

// ==========================================================
// INICIA O SERVIDOR
// ==========================================================
app.listen(port, () => { 
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Backend rodando em http://localhost:${port}`);
});