const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// app agora é aplicacao
const aplicacao = express();

// configurando o servidor
aplicacao.use(cors());
aplicacao.use(express.json());

// conectando com o banco de dados
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(erro => console.error('Erro ao conectar ao MongoDB:', erro));

// configurando as rotas da api
aplicacao.use('/api/users', require('./routes/users'));
aplicacao.use('/api/destinations', require('./routes/destinations'));

// definindo a porta e iniciando o servidor
const PORTA = process.env.PORT || 5000;
aplicacao.listen(PORTA, () => console.log(`Servidor rodando na porta ${PORTA}`));
