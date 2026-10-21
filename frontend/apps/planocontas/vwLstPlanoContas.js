// arquivo: ./apps/planocontas/vwLstPlanoContas.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('planoContasListagem');
  var alertBox = document.getElementById('planoContasAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesPlanoContas();
  vwGetAllPlanoContas(servidorDw3, alertBox);
});

async function vwGetAllPlanoContas(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllPlanoContas', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o plano de contas.');
    }

    var data = await response.json();

    if (data.auth === false) {
      throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPlanoContas(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar o plano de contas.');
    inicializarTabelaPlanoContas([]);
  }
}

function inicializarTabelaPlanoContas(contas) {
  new DataTable('#tblPlanoContas', {
    data: contas,
    columns: [
      { data: 'planocontaid', defaultContent: '' },
      { data: 'codigo', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
      { data: 'tipo', defaultContent: '' },
      {
        data: 'ativo',
        defaultContent: '',
        render: function(data) {
          return data ? 'Sim' : 'Não';
        }
      },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var planoContaId = escaparHtml(row.planocontaid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações da conta">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-planocontaid="' + planoContaId + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-planocontaid="' + planoContaId + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-planocontaid="' + planoContaId + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: {
      emptyTable: 'Nenhuma conta cadastrada.',
      info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
      infoEmpty: 'Mostrando 0 até 0 de 0 registros',
      infoFiltered: '(filtrado de _MAX_ registros no total)',
      lengthMenu: 'Mostrar _MENU_ registros',
      loadingRecords: 'Carregando...',
      processing: 'Processando...',
      search: 'Pesquisar:',
      zeroRecords: 'Nenhum registro encontrado',
      paginate: {
        first: 'Primeiro',
        last: 'Último',
        next: 'Próximo',
        previous: 'Anterior'
      }
    }
  });
}

function configurarOperacoesPlanoContas() {
  var tabela = document.getElementById('tblPlanoContas');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-planocontaid]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    if (oper) {
      window.location.href = '/planocontas/form?oper=' + oper + '&planoContaId=' + encodeURIComponent(botao.dataset.planocontaid);
    }
  });
}

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-info');
  alertBox.classList.add('alert-danger');
  alertBox.classList.remove('d-none');
}
//...
