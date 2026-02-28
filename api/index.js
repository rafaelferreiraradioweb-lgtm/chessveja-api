const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api', async (req, res) => {
    const pgn = req.body.pgn;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!pgn) return res.status(400).json({ erro: "PGN não enviado." });

    // PROMPT TURBO: Focado em velocidade e nos 3 pontos principais
    const prompt = `Você é o mestre Chessveja. Analise este PGN de forma ultra-objetiva.
    Sua resposta DEVE seguir este formato:

    GENIAIS: [número]
    CAPIVARAS: [número]

    3 MOMENTOS CRÍTICOS:
    [Liste apenas as 3 jogadas que decidiram a partida, explicando o erro e a melhor opção brevemente].

    PLANOS ESTRATÉGICOS:
    [Um parágrafo curto sobre o plano correto para ambos].

    CONCLUSÃO:
    [Uma frase de lição final].

    PGN: ${pgn}`;

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
                max_tokens: 500, // Limita o tamanho para ser mais rápido
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.choices) {
            res.json({ resultado: data.choices[0].message.content });
        } else {
            res.status(500).json({ erro: "Erro na resposta da IA." });
        }
    } catch (error) {
        res.status(500).json({ erro: "Erro de conexão." });
    }
});

module.exports = app;
