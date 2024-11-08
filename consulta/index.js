const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const baseConsulta = {};

const funcoes = {
    LembreteCriado: (lembrete) => {
        baseConsulta[lembrete.contador] = { ...lembrete, observacoes: [] };
    },
    ObservacaoCriada: (observacao) => {
        const lembrete = baseConsulta[observacao.lembreteId] || { observacoes: [] };
        lembrete.observacoes.push(observacao);
        baseConsulta[observacao.lembreteId] = lembrete;
    },
    ObservacaoAtualizada: (observacao) => {
        const lembrete = baseConsulta[observacao.lembreteId];
        if (lembrete) {
            const indice = lembrete.observacoes.findIndex((o) => o.id === observacao.id);
            if (indice !== -1) {
                lembrete.observacoes[indice] = observacao;
            }
        }
    },
};

app.post('/eventos', (req, res) => {
    const { tipo, dados } = req.body;
    if (funcoes[tipo]) {
        funcoes[tipo](dados);
    }
    res.status(200).send({ msg: 'ok' });
});

app.get('/lembretes', (req, res) => {
    res.status(200).send(baseConsulta);
});

app.listen(6000, async () => {
    console.log("Consultas. Porta 6000");

    try {
        const resp = await axios.get("http://barramento-de-eventos:10000/eventos");
        resp.data.forEach((evento) => {
            const funcao = funcoes[evento.tipo];
            if (funcao) {
                funcao(evento.dados);
            }
        });
    } catch (err) {
        console.error("Erro ao buscar eventos:", err.message);
    }
});
