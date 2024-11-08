const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());

const observacoesPorLembreteId = {};

app.post('/eventos', (req, res) => {
  try {
    if (funcoes[req.body.tipo]) {
      funcoes[req.body.tipo](req.body.dados);
      res.status(200).send({ msg: 'Evento processado com sucesso' });
    } else {
      res.status(400).send({ msg: 'Tipo de evento desconhecido' });
    }
  } catch (err) {
    console.error('Erro no processamento do evento:', err);
    res.status(500).send({ msg: 'Erro ao processar o evento' });
  }
});

app.put('/lembretes/:id/observacoes', async (req, res) => {
  const idObs = uuidv4();
  const { texto } = req.body;
  const observacoesDoLembrete = observacoesPorLembreteId[req.params.id] || [];

  observacoesDoLembrete.push({ id: idObs, texto, status: 'aguardando' });
  observacoesPorLembreteId[req.params.id] = observacoesDoLembrete;

  const evento = {
    tipo: 'ObservacaoCriada',
    dados: { id: idObs, texto, lembreteId: req.params.id, status: 'aguardando' },
  };

  try {
    await axios.post('http://barramento-de-eventos:10000/eventos', evento);
    res.status(201).send(observacoesDoLembrete);
  } catch (err) {
    console.error('Erro ao enviar evento ObservacaoCriada:', err.message);
    res.status(500).send({ msg: 'Erro ao criar observação' });
  }
});

const funcoes = {
  ObservacaoClassificada: async (observacao) => {
    const observacoes = observacoesPorLembreteId[observacao.lembreteId];
    const obsParaAtualizar = observacoes.find(o => o.id === observacao.id);

    if (!obsParaAtualizar) {
      console.error('Observação não encontrada');
      return;
    }

    obsParaAtualizar.status = observacao.status;

    const evento = {
      tipo: 'ObservacaoAtualizada',
      dados: {
        id: observacao.id,
        texto: observacao.texto,
        lembreteId: observacao.lembreteId,
        status: observacao.status,
      },
    };

    try {
      await axios.post('http://barramento-de-eventos:10000/eventos', evento);
    } catch (error) {
      console.error('Erro ao enviar evento ObservacaoAtualizada:', error.message);
    }
  },
};

app.get('/lembretes/:id/observacoes', (req, res) => {
  res.send(observacoesPorLembreteId[req.params.id] || []);
});

app.listen(5000, () => {
  console.log('Observações. Porta 5000');
});
