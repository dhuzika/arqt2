const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const lembretes = {};
let contador = 0;

app.put('/lembretes', async (req, res) => {
    contador++;
    const { texto } = req.body;
    lembretes[contador] = { contador, texto };

    try {
        await axios.post("http://barramento-de-eventos:10000/eventos", {
            tipo: "LembreteCriado",
            dados: { contador, texto }
        });
    } catch (error) {
        console.error("Erro ao enviar evento para o barramento:", error.message);
    }

    res.status(201).send(lembretes[contador]);
});

app.get('/lembretes', (req, res) => {
    res.send(lembretes);
});

app.post('/eventos', (req, res) => {
    res.status(200).send({ msg: 'ok' });
});

app.listen(4000, () => console.log('Lembretes. Porta 4000'));
