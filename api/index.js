const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api', async (req, res) => {
    const pgn = req.body.pgn;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!pgn) return res.status(400).json({ erro: "PGN não enviado." });

    // PROMPT MINIMALISTA: Para resposta em 2-3 segundos
    const prompt = `Analise este PGN. Liste apenas os lances mais importantes e explique o porquê de cada um em uma única frase curta. Seja direto. PGN: ${pgn}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 250, // Quase nada de texto para ser instantâneo
                temperature: 0.5
            })
        });

        const data = await response.json();
        res.json({ resultado: data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ erro: "Erro rápido." });
    }
});

module.exports = app;
