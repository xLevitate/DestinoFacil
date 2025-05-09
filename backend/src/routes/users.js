const express = require('express');
const roteador = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/User');

const autenticacao = require('../middleware/auth');

// rota para registrar novo usuario
roteador.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    // verifica se o usuario ja existe
    let usuario = await Usuario.findOne({ email });
    if (usuario) {
      return res.status(400).json({ msg: 'Usuário já existe' });
    }
    
    // cria novo usuario
    usuario = new Usuario({
      nome,
      email,
      senha
    });
    
    await usuario.save();
    
    // cria o token jwt
    const carga = {
      usuario: {
        id: usuario.id
      }
    };
    
    jwt.sign(
      carga,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (erro, token) => {
        if (erro) throw erro;
        res.json({ token });
      }
    );
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

// rota para login
roteador.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // busca usuario pelo email
    let usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }
    
    // verifica a senha
    const senhaCorreta = await usuario.compareSenha(senha);
    if (!senhaCorreta) {
      return res.status(400).json({ msg: 'Credenciais inválidas' });
    }
    
    // cria o token jwt
    const carga = {
      usuario: {
        id: usuario.id
      }
    };
    
    jwt.sign(
      carga,
      process.env.JWT_SECRET,
      { expiresIn: '5d' },
      (erro, token) => {
        if (erro) throw erro;
        res.json({ token });
      }
    );
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

// rota para obter dados do usuario logado
roteador.get('/me', autenticacao, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');
    res.json(usuario);
  } catch (erro) {
    console.error(erro.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = roteador;
