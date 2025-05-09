const jwt = require('jsonwebtoken');

// middleware para verificar o token de autenticacao
module.exports = function(req, res, proximo) {
  // pega o token do header
  const token = req.header('x-auth-token');
  
  // verifica se tem token
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }
  
  try {
    // decodifica o token
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    
    // adiciona os dados do usuario na requisicao
    req.usuario = decodificado.usuario;
    proximo();
  } catch (erro) {
    res.status(401).json({ msg: 'Token inválido' });
  }
};
