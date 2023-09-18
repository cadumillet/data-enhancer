export interface AppConfiguration {
  padraoBaseUrl: string;
  padraoUsername: string;
  padraoPassword: string;
}

const config = {
  validaIdUrl: process.env.VALIDA_ID_URL || "",
  validaIdRegional: process.env.VALIDA_ID_REGIONAL || "",
  validaIdCodigo: process.env.VALIDA_ID_CODIGO || "",
  validaIdSenha: process.env.VALIDA_ID_SENHA || "",
  validaIdConsulta: process.env.VALIDA_ID_CONSULTA || "",
  validaIdCadastroCompleto: process.env.VALIDA_ID_CADASTRO_COMPLETO || "",
  validaIdLocalizacao: process.env.VALIDA_ID_LOCALIZACAO || "",
  validaIdQualificacao: process.env.VALIDA_ID_QUALIFICACAO || "",
  validaIdCadastroBasico: process.env.VALIDA_ID_CADASTRO_BASICO || "",

  padraoBaseUrl: process.env.PADRAO_BASE_URL || "",
  padraoUsername: process.env.PADRAO_USERNAME || "",
  padraoPassword: process.env.PADRAO_PASSWORD || "",
};

export default config;
