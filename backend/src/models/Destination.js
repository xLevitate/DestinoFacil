const mongoose = require('mongoose');

// esquema do destino turistico
const EsquemaDestino = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  localizacao: {
    type: String,
    required: true
  },
  imagens: [{
    type: String
  }],
  categorias: [{
    type: String
  }],
  precoEstimado: {
    type: Number
  },
  avaliacoes: [{
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comentario: String,
    nota: Number
  }],
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// exportando o modelo
module.exports = mongoose.model('Destination', EsquemaDestino);
