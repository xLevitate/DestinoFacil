const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ dataCriacao: -1 });
    res.json(destinations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ msg: 'Destino não encontrado' });
    }
    
    res.json(destination);
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Destino não encontrado' });
    }
    
    res.status(500).send('Erro no servidor');
  }
});

router.post('/favorite/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.destinosFavoritos.includes(req.params.id)) {
      return res.status(400).json({ msg: 'Destino já está nos favoritos' });
    }
    
    user.destinosFavoritos.push(req.params.id);
    await user.save();
    
    res.json(user.destinosFavoritos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.post('/search', async (req, res) => {
  try {
    const { categorias, localizacao, precoMaximo } = req.body;
    
    const query = {};
    
    if (categorias && categorias.length > 0) {
      query.categorias = { $in: categorias };
    }
    
    if (localizacao) {
      query.localizacao = new RegExp(localizacao, 'i');
    }
    
    if (precoMaximo) {
      query.precoEstimado = { $lte: precoMaximo };
    }
    
    const destinations = await Destination.find(query).sort({ dataCriacao: -1 });
    res.json(destinations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
