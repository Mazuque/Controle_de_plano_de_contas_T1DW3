//-- arquivo apps/planocontas/model/mdlPlanoContas.js

const db = require("../../../database/databaseconfig");
const mensagemErro = require("../../../database/mensagemErro");

const GetAllPlanoContas = async () => {
  return (
    await db.query(
      "SELECT * " + "FROM planocontas where removido = false ORDER BY codigo ASC"
    )
  ).rows;
};

const GetPlanoContaByID = async (planoContaIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM planocontas WHERE planocontaid = $1 and removido = false ORDER BY codigo ASC",
      [planoContaIDPar]
    )
  ).rows;
};

const InsertPlanoConta = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let planocontaid = null;
  let msg = "ok";
  try {
    const resultado = await db.query(
      "INSERT INTO planocontas " + "values(default, $1, $2, $3, $4, false) RETURNING planocontaid",
      [
        registroPar.codigo,
        registroPar.descricao,
        registroPar.tipo,
        registroPar.ativo,
      ]
    );
    linhasAfetadas = resultado.rowCount;
    planocontaid = resultado.rows[0].planocontaid; //@ ID gerado pelo bigserial
  } catch (error) {
    msg = "[mdlPlanoContas|InsertPlanoConta] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas, planocontaid };
};

const UpdatePlanoConta = async (planoContaIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE planocontas SET " +
          "codigo = $2, " +
          "descricao = $3, " +
          "tipo = $4, " +
          "ativo = $5 " +
          "WHERE planocontaid = $1 and removido = false",
        [
          planoContaIDPar,
          registroPar.codigo,
          registroPar.descricao,
          registroPar.tipo,
          registroPar.ativo,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPlanoContas|UpdatePlanoConta] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePlanoConta = async (planoContaIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    //@ Não deixa remover uma conta que ainda tem lançamentos.
    const totalLancamentos = (
      await db.query(
        "SELECT count(*) FROM lancamentos WHERE planocontaid = $1 and removido = false",
        [planoContaIDPar]
      )
    ).rows[0].count;

    if (totalLancamentos > 0) {
      return { msg: "Esta conta possui lançamentos e não pode ser removida.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE planocontas SET " + "removido = true " + "WHERE planocontaid = $1",
        [planoContaIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPlanoContas|DeletePlanoConta] " + mensagemErro(error);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPlanoContas,
  GetPlanoContaByID,
  InsertPlanoConta,
  UpdatePlanoConta,
  DeletePlanoConta,
};
