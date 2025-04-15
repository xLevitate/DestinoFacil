const mongoose = require('mongoose');

const DestinationSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Destination', DestinationSchema);
