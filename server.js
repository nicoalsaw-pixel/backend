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
app.get('/api/views', async (req, res) => {
    const forwarded = req.header('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;

    const client = await pool.connect();
    let isNewView = false;
    
    try {
        const ipInsertResult = await client.query(
            'INSERT INTO visited_ips (ip_address) VALUES ($1) ON CONFLICT (ip_address) DO NOTHING RETURNING ip_address',
            [clientIp]
        );
        if (ipInsertResult.rowCount > 0) {
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

app.listen(port, () => { 
  console.log(`Servidor rodando na porta ${port}`);
});
