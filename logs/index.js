const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const logs = [];

app.post('/eventos', (req, res) => {
    const { tipo, dados } = req.body;
    const novoLog = {
        id: uuidv4(),
        tipo_evento: tipo,
        data_hora: new Date().toLocaleString(),
    };

    logs.push(novoLog);
    console.log('Evento registrado:', novoLog);
    res.status(200).send({ msg: 'Log registrado com sucesso' });
});

app.get('/logs', (req, res) => {
    res.status(200).send(logs);
});

app.listen(8000, () => {
    console.log('Microsserviço de Logs. Porta 8000.');
});
