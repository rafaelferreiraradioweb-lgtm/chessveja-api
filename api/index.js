const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api', async (req, res) => {
    const pgn = req.body.pgn;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!pgn) return res.status(400).json({ erro: "PGN não enviado." });

    // PROMPT ULTRA RÁPIDO
    const prompt = `Analise este PGN de xadrez de forma técnica e curta.
    Responda EXATAMENTE assim:

    GENIAIS: [número]
    CAPIVARAS: [número]

    3 PIORES LANCES:
    1. [lance]: [por que foi ruim] -> Sugestão: [melhor lance].
    2. [lance]: [por que foi ruim] -> Sugestão: [melhor lance].
    3. [lance]: [por que foi ruim] -> Sugestão: [melhor lance].

    PLANOS GERAIS:
    [Plano das Brancas e das Pretas em uma frase].

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
                max_tokens: 400, // Menos texto = mais velocidade
                temperature: 0.3 // Respostas mais lógicas e diretas
            })
        });

        const data = await response.json();
        if (data.choices) {
            res.json({ resultado: data.choices[0].message.content });
        } else {
            res.status(500).json({ erro: "IA indisponível." });
        }
    } catch (error) {
        res.status(500).json({ erro: "Erro de rede." });
    }
});

module.exports = app;
