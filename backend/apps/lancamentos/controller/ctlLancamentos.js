//-- arquivo apps/lancamentos/controller/ctlLancamentos.js

const mdlLancamentos = require("../model/mdlLancamentos");

// Elimina parte final de uma variável data com essa: 2026-09-02T03:00:00.000Z
const formataData = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.datalancamento) {
      row.datalancamento = row.datalancamento.toISOString().split('T')[0];
    }
  }
  return registro;
};

const GetAllLancamentos = (req, res) =>
  (async () => {
    let registro = await mdlLancamentos.GetAllLancamentos();
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetLancamentoByID = (req, res) =>
  (async () => {
    const lancamentoID = parseInt(req.params.lancamentoid);
    let registro = await mdlLancamentos.GetLancamentoByID(lancamentoID);
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetPlanoContasToLancamentos = (req, res) =>
  (async () => {
    let registro = await mdlLancamentos.GetPlanoContasToLancamentos();
    res.json({ status: "ok", "registro": registro });
  })();

const InsertLancamento = (request, res) =>
  (async () => {
    const lancamentoREG = request.body;
    let { msg, linhasAfetadas, lancamentoid } = await mdlLancamentos.InsertLancamento(lancamentoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas, "lancamentoid": lancamentoid });
  })();

const UpdateLancamento = (request, res) =>
  (async () => {
    const lancamentoID = parseInt(request.params.lancamentoid);
    const lancamentoREG = request.body;
    let { msg, linhasAfetadas } = await mdlLancamentos.UpdateLancamento(lancamentoID, lancamentoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeleteLancamento = (request, res) =>
  (async () => {
    const lancamentoID = parseInt(request.params.lancamentoid);
    let { msg, linhasAfetadas } = await mdlLancamentos.DeleteLancamento(lancamentoID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllLancamentos,
  GetLancamentoByID,
  GetPlanoContasToLancamentos,
  InsertLancamento,
  UpdateLancamento,
  DeleteLancamento,
};
