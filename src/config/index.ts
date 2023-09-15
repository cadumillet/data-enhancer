const validaIdUrl = process.env.VALIDA_ID_URL || "";
const validaIdRegional = process.env.VALIDA_ID_REGIONAL;
const validaIdCodigo = process.env.VALIDA_ID_CODIGO;
const validaIdSenha = process.env.VALIDA_ID_SENHA;
const validaIdConsulta = process.env.VALIDA_ID_CONSULTA;
const validaIdCadastroCompleto = process.env.VALIDA_ID_CADASTRO_COMPLETO;
const validaIdLocalizacao = process.env.VALIDA_ID_LOCALIZACAO;
const validaIdQualificacao = process.env.VALIDA_ID_QUALIFICACAO;
const validaIdCadastroBasico = process.env.VALIDA_ID_CADASTRO_BASICO;

const padraoBaseUrl = process.env.PADRAO_BASE_URL || "";
const padraoUsername = process.env.PADRAO_USERNAME || "";
const padraoPassword = process.env.PADRAO_PASSWORD || "";

export {
  validaIdCadastroBasico,
  validaIdCadastroCompleto,
  validaIdCodigo,
  validaIdConsulta,
  validaIdLocalizacao,
  validaIdQualificacao,
  validaIdRegional,
  validaIdSenha,
  validaIdUrl,
  padraoBaseUrl,
  padraoPassword,
  padraoUsername,
};
