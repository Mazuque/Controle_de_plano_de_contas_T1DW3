//-- arquivo apps/planocontas/controller/ctlPlanoContas.js

const mdlPlanoContas = require("../model/mdlPlanoContas");

const GetAllPlanoContas = (req, res) =>
  (async () => {
    let registro = await mdlPlanoContas.GetAllPlanoContas();
    res.json({ status: "ok", "registro": registro });
  })();

const GetPlanoContaByID = (req, res) =>
  (async () => {
    const planoContaID = parseInt(req.params.planocontaid);
    let registro = await mdlPlanoContas.GetPlanoContaByID(planoContaID);
    res.json({ status: "ok", "registro": registro });
  })();

const InsertPlanoConta = (request, res) =>
  (async () => {
    const planoContaREG = request.body;
    let { msg, linhasAfetadas, planocontaid } = await mdlPlanoContas.InsertPlanoConta(planoContaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas, "planocontaid": planocontaid });
  })();

const UpdatePlanoConta = (request, res) =>
  (async () => {
    const planoContaID = parseInt(request.params.planocontaid);
    const planoContaREG = request.body;
    let { msg, linhasAfetadas } = await mdlPlanoContas.UpdatePlanoConta(planoContaID, planoContaREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeletePlanoConta = (request, res) =>
  (async () => {
    const planoContaID = parseInt(request.params.planocontaid);
    let { msg, linhasAfetadas } = await mdlPlanoContas.DeletePlanoConta(planoContaID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllPlanoContas,
  GetPlanoContaByID,
  InsertPlanoConta,
  UpdatePlanoConta,
  DeletePlanoConta,
};
