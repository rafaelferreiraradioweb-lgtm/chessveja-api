const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Rota para analisar a partida com a chave da OpenAI protegida
app.post('/api/analisar', async (req, res) => {
    const pgn = req.body.pgn;
    
    // A chave secreta que ficará guardada na Vercel
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!pgn) {
        return res.status(400).json({ erro: "PGN não enviado." });
    }

    const prompt = `Analise a seguinte partida de xadrez em PGN.
    Você deve responder EXATAMENTE neste formato:
    GENIAIS: [número de lances muito bons ou brilhantes]
    CAPIVARDAS: [número de erros graves ou blunders]
    ANÁLISE: [Sua análise detalhada, amigável e didática, explicando os momentos críticos, os erros e sugerindo lances melhores. Fale diretamente com o jogador em português].

    PGN da partida:
    ${pgn}`;

    try {
        // Usando o fetch nativo do Node.js
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            res.json({ resultado: data.choices[0].message.content });
        } else {
            res.status(500).json({ erro: "A IA não retornou uma resposta válida." });
        }
    } catch (error) {
        res.status(500).json({ erro: "Erro ao conectar com a IA." });
    }
});

module.exports = app;
