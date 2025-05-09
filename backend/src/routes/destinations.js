const express = require('express');
const roteador = express.Router();
const Destino = require('../models/Destination');
const autenticacao = require('../middleware/auth');
const Usuario = require('../models/User');

// pega todos os destinos
roteador.get('/', async (req, res) => {
  try {
    const destinos = await Destino.find().sort({ dataCriacao: -1 });
    res.json(destinos);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

// pega um destino pelo id
roteador.get('/:id', async (req, res) => {
  try {
    const destino = await Destino.findById(req.params.id);
    
    // verifica se o destino existe
    if (!destino) {
      return res.status(404).json({ msg: 'Destino não encontrado' });
    }
    
    res.json(destino);
  } catch (erro) {
    console.error(erro.message);
    
    if (erro.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Destino não encontrado' });
    }
    
    res.status(500).send('Erro no servidor');
  }
});

// adiciona um destino aos favoritos
roteador.post('/favorite/:id', autenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);
    
    // verifica se ja esta nos favoritos
    if (usuario.destinosFavoritos.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Destino já está nos favoritos' });
    }
    
    // adiciona aos favoritos
    usuario.destinosFavoritos.push(req.params.id);
    await usuario.save();
    
    res.json(usuario.destinosFavoritos);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

// busca destinos com filtros
roteador.post('/search', async (req, res) => {
  try {
    const { categorias, localizacao, precoMaximo } = req.body;
    
    const consulta = {};
    
    // adiciona filtros na consulta
    if (categorias && categorias.length > 0) {
      consulta.categorias = { $in: categorias };
    }
    
    if (localizacao) {
      consulta.localizacao = new RegExp(localizacao, 'i');
    }
    
    if (precoMaximo) {
      consulta.precoEstimado = { $lte: precoMaximo };
    }
    
    const destinos = await Destino.find(consulta).sort({ dataCriacao: -1 });
    res.json(destinos);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = roteador;
