// Arquivo: apps/planocontas/vwFormPlanoContas.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPlanoContas');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirPlanoConta');
  var btnAtualizar = document.getElementById('btnAtualizarPlanoConta');
  var btnRemover = document.getElementById('btnRemoverPlanoConta');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertPlanoConta();
    });
  }

  if (oper === 'Re') {
    bloquearCamposPlanoConta();
    vwGetPlanoContaByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePlanoConta();
    });
    btnAtualizar.disabled = !(await vwGetPlanoContaByID());
  }

  if (oper === 'De') {
    bloquearCamposPlanoConta();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeletePlanoConta();
    });
    btnRemover.disabled = !(await vwGetPlanoContaByID());
  }
});

function bloquearCamposPlanoConta() {
  document.getElementById('codigo').readOnly = true;
  document.getElementById('descricao').readOnly = true;
  document.getElementById('tipo').disabled = true;
  document.getElementById('ativo').disabled = true;
}

function montarPlanoContaDoFormulario() {
  return {
    codigo: document.getElementById('codigo').value,
    descricao: document.getElementById('descricao').value,
    tipo: document.getElementById('tipo').value,
    ativo: document.getElementById('ativo').checked
  };
}

function obterPlanoContaIdDaUrl() {
  var planoContaId = new URLSearchParams(window.location.search).get('planoContaId');

  if (!planoContaId || !/^\d+$/.test(planoContaId) || Number(planoContaId) <= 0) {
    throw new Error('ID da conta inválido.');
  }

  return planoContaId;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoPlanoConta(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmPlanoContas').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Retorna true quando a conta foi carregada no formulário.
async function vwGetPlanoContaByID() {
  try {
    var planoContaId = obterPlanoContaIdDaUrl();
    var data = await enviarRequisicaoPlanoConta('/getPlanoContaByID/' + encodeURIComponent(planoContaId), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a conta.');

    var conta = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!conta) {
      throw new Error('Conta não encontrada.');
    }

    document.getElementById('planocontaid').value = conta.planocontaid;
    document.getElementById('codigo').value = conta.codigo ?? '';
    document.getElementById('descricao').value = conta.descricao ?? '';
    document.getElementById('tipo').value = conta.tipo ?? '';
    document.getElementById('ativo').checked = conta.ativo === true;
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar conta.');
    return false;
  }
}

async function vwInsertPlanoConta() {
  var form = document.getElementById('frmPlanoContas');
  var btnInserir = document.getElementById('btnInserirPlanoConta');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoPlanoConta('/insertPlanoConta', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPlanoContaDoFormulario())
    }, 'Não foi possível inserir a conta.');

    window.location.href = '/planocontas';
  } catch (error) {
    alert(error.message || 'Erro ao inserir conta.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePlanoConta() {
  var form = document.getElementById('frmPlanoContas');
  var btnAtualizar = document.getElementById('btnAtualizarPlanoConta');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var planoContaId = obterPlanoContaIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoPlanoConta('/updatePlanoConta/' + encodeURIComponent(planoContaId), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPlanoContaDoFormulario())
    }, 'Não foi possível atualizar a conta.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma conta foi atualizada.');
    }

    alert('Conta atualizada com sucesso.');
    window.location.href = '/planocontas';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar conta.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePlanoConta() {
  var btnRemover = document.getElementById('btnRemoverPlanoConta');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção desta conta?')) {
    return;
  }

  try {
    var planoContaId = obterPlanoContaIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoPlanoConta('/deletePlanoConta/' + encodeURIComponent(planoContaId), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover a conta.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma conta foi removida.');
    }

    window.location.href = '/planocontas';
  } catch (error) {
    alert(error.message || 'Erro ao remover conta.');
  } finally {
    btnRemover.disabled = false;
  }
}
//...