const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// esquema do usuario
const EsquemaUsuario = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  destinosFavoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

// criptografa a senha antes de salvar
EsquemaUsuario.pre('save', async function(proximo) {
  if (!this.isModified('senha')) return proximo();
  
  try {
    const sal = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, sal);
    proximo();
  } catch (erro) {
    proximo(erro);
  }
});

// método para comparar senha
EsquemaUsuario.methods.compareSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User', EsquemaUsuario);
