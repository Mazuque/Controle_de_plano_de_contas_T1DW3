//-- arquivo apps/lancamentos/model/mdlLancamentos.js

const db = require("../../../database/databaseconfig");
const mensagemErro = require("../../../database/mensagemErro");

const GetAllLancamentos = async () => {
  return (
    await db.query(
      "SELECT l.*, p.codigo, p.descricao as contadescricao, p.tipo " +
        "FROM lancamentos l INNER JOIN planocontas p ON p.planocontaid = l.planocontaid " +
        "WHERE l.removido = false ORDER BY l.datalancamento DESC, l.lancamentoid DESC"
    )
  ).rows;
};

const GetLancamentoByID = async (lancamentoIDPar) => {
  return (
    await db.query(
      "SELECT l.*, p.codigo, p.descricao as contadescricao, p.tipo " +
        "FROM lancamentos l INNER JOIN planocontas p ON p.planocontaid = l.planocontaid " +
        "WHERE l.lancamentoid = $1 and l.removido = false",
      [lancamentoIDPar]
    )
  ).rows;
};

//@ Contas usadas no componente Select do formulário de lançamentos.
const GetPlanoContasToLancamentos = async () => {
  return (
    await db.query(
      "SELECT planocontaid, codigo, descricao, tipo FROM planocontas " +
        "WHERE removido = false and ativo = true ORDER BY codigo ASC"
    )
  ).rows;
};

const InsertLancamento = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let lancamentoid = null;
  let msg = "ok";
  try {
    const resultado = await db.query(
      "INSERT INTO lancamentos " + "values(default, $1, $2, $3, $4, false) RETURNING lancamentoid",
      [
        registroPar.descricao,
        registroPar.valor,
        registroPar.datalancamento,
        registroPar.planocontaid,
      ]
    );
    linhasAfetadas = resultado.rowCount;
    lancamentoid = resultado.rows[0].lancamentoid; //@ ID gerado pelo bigserial
  } catch (error) {
    msg = "[mdlLancamentos|InsertLancamento] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas, lancamentoid };
};

const UpdateLancamento = async (lancamentoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE lancamentos SET " +
          "descricao = $2, " +
          "valor = $3, " +
          "datalancamento = $4, " +
          "planocontaid = $5 " +
          "WHERE lancamentoid = $1 and removido = false",
        [
          lancamentoIDPar,
          registroPar.descricao,
          registroPar.valor,
          registroPar.datalancamento,
          registroPar.planocontaid,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlLancamentos|UpdateLancamento] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteLancamento = async (lancamentoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE lancamentos SET " + "removido = true " + "WHERE lancamentoid = $1 and removido = false",
        [lancamentoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlLancamentos|DeleteLancamento] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllLancamentos,
  GetLancamentoByID,
  GetPlanoContasToLancamentos,
  InsertLancamento,
  UpdateLancamento,
  DeleteLancamento,
};
