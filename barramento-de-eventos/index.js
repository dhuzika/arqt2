const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const eventos = [];

app.post('/eventos', async (req, res) => {
    const evento = req.body;
    
    eventos.push(evento);

    const servicos = [
        'http://lembretes:4000/eventos',
        'http://observacoes:5000/eventos',
        'http://consulta:6000/eventos',
        'http://classificacao:7000/eventos',
        'http://logs:8000/eventos'
    ];

    for (const url of servicos) {
        try {
            await axios.post(url, evento);
        } catch (error) {
            console.error(`Erro ao enviar evento para ${url}: ${error.message}`);
        }
    }

    res.status(200).send({ msg: 'ok' });
});

app.get('/eventos', (req, res) => {
    res.send(eventos);
});

app.listen(10000, () => {
    console.log('Barramento de eventos. Porta 10000');
});
