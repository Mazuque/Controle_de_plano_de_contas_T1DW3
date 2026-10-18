// ./database/mensagemErro.js
//@ Traduz os erros do PostgreSQL para mensagens que o usuário entenda.
//@ Os códigos estão na documentação do PostgreSQL (Appendix A - Error Codes).

const mensagemErro = (error) => {
  switch (error.code) {
    case "23505": //@ unique_violation
      if (error.constraint === "planocontas_codigo_key")
        return "Já existe uma conta com este código.";
      return "Registro duplicado.";

    case "23514": //@ check_violation
      if (error.constraint === "ck_planocontas_tipo")
        return "O tipo deve ser 'Receita' ou 'Despesa'.";
      return "Algum campo possui valor não permitido.";

    case "23503": //@ foreign_key_violation
      return "A conta do plano de contas informada não existe.";

    case "23502": //@ not_null_violation
      return "O campo '" + error.column + "' é obrigatório.";

    case "22001": //@ string_data_right_truncation
      return "Algum campo ultrapassou o tamanho máximo permitido.";

    case "22003": //@ numeric_value_out_of_range
      return "Valor numérico fora do limite permitido.";

    case "22007": //@ invalid_datetime_format
    case "22008": //@ datetime_field_overflow
      return "Data inválida.";

    case "22P02": //@ invalid_text_representation
      return "Algum campo possui formato inválido (ex.: texto em campo numérico).";
  }

  //@ Erro não previsto: devolve o que o banco informou.
  return error.detail || error.message;
};

module.exports = mensagemErro;
