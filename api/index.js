const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api', async (req, res) => {
    const pgn = req.body.pgn;
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!pgn) return res.status(400).json({ erro: "PGN não enviado." });

    // SUPER PROMPT: Instruções detalhadas para análise de mestre
    const prompt = `Você é o mestre de xadrez do Chessveja. Analise o PGN abaixo de forma profunda e didática.
    Sua resposta DEVE seguir EXATAMENTE este formato de rótulos:

    GENIAIS: [número total]
    CAPIVARADAS: [número total de erros graves]

    TEORIA E ABERTURA: 
    [Identifique a abertura e comente brevemente a teoria por trás dela].

    ANÁLISE LANCE A LANCE: 
    [Destaque os momentos críticos. Explique por que certos lances foram bons ou ruins. Para erros, sugira SEMPRE a melhor jogada no formato: "O melhor seria (lance) porque..."].

    PLANOS ESTRATÉGICOS: 
    [Explique o que as brancas e pretas deveriam estar tentando fazer no meio-jogo].

    CONCLUSÃO: 
    [Resumo da partida e uma lição para o jogador levar para a próxima].

    PGN da partida:
    ${pgn}`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // Você pode usar gpt-4o se tiver saldo para uma análise ainda mais absurda
                messages: [{ role: "user", content: prompt }],
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
