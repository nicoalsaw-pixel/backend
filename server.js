// server.js - Versão Final com Lógica Robusta de IP Único
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3000; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

app.use(cors());

// ==========================================================
// ROTA: CONTADOR DE VIEWS ÚNICAS (/api/views)
// ==========================================================
app.get('/api/views', async (req, res) => {
    // 1. OBTÉM O IP DE FORMA ROBUSTA:
    const forwarded = req.header('x-forwarded-for');
    // Se o cabeçalho existir, usa o primeiro IP (o do cliente real). Caso contrário, usa o IP da conexão direta.
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

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
        client.release();
    }
});

// ==========================================================
// INICIA O SERVIDOR
// ==========================================================
app.listen(port, () => { 
  console.log(`Servidor rodando na porta ${port}`);
});