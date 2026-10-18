//-- apps/login/controller/ctlLogin.js

const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

//@ Tokens que já fizeram logout. Guarda token -> data de expiração (em segundos).
//@ Fica em memória: se o backend reiniciar, a lista é zerada.
const tokensInvalidados = new Map();

const Login = async (req, res, next) => {
  const credencial = await mdlLogin.GetCredencial(req.body.UserName);

  if (credencial.length == 0) {
    return res.status(403).json({ message: "Usuário não identificado!" });
  }

  if (bCrypt.compareSync(req.body.Password, credencial[0].password)) {
    //auth ok
    const username = credencial[0].username;
    const token = jwt.sign({ username }, process.env.SECRET_API, {
      expiresIn: 120 * 60, //@ Expira em 02 horas
    });
    return res.json({ auth: true, token: token, username: username });
  }

  res.status(403).json({ message: "Login inválido!" });
};

function AutenticaJWT(req, res, next) {
  const tokenHeader = req.headers["authorization"];
  if (!tokenHeader)
    return res
      .status(200)
      .json({ auth: false, message: "Não foi informado o token JWT" });

  const bearer = tokenHeader.split(" ");
  const token = bearer[1];

  if (tokensInvalidados.has(token))
    return res
      .status(200)
      .json({ auth: false, message: "JWT inválido ou expirado" });

  jwt.verify(token, process.env.SECRET_API, function (err, decoded) {
    if (err)
      return res
        .status(200)
        .json({ auth: false, message: "JWT inválido ou expirado" });

    req.username = decoded.username;
    next();
  });
}

const Logout = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];
  const token = tokenHeader ? tokenHeader.split(" ")[1] : null;
  const decoded = token ? jwt.decode(token) : null;

  //@ Só guarda o token se ele for válido (tem data de expiração).
  if (decoded && decoded.exp) {
    tokensInvalidados.set(token, decoded.exp);
  }

  //@ Remove da lista os tokens que já expiraram, para ela não crescer para sempre.
  const agora = Math.floor(Date.now() / 1000);
  for (const [tk, exp] of tokensInvalidados) {
    if (exp < agora) tokensInvalidados.delete(tk);
  }

  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};
