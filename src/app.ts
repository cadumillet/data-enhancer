import * as fs from "fs";
import axios from "axios";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";
import moment from "moment";
// import config from "./config";
import qs from "qs";
import "dotenv/config";

interface User {
  cpf: string;
}

type AddressInfo = {
  EMAIL?: string;
  LOGRADOURO?: string;
  NUMERO?: number;
  COMPLEMENTO?: string;
  BAIRRO?: string;
  UF?: string;
  CIDADE?: string;
  CEP?: string;
  TELEFONE?: {
    DDD?: number;
    NUMERO?: number;
  };
};

type BasicInfo = {
  CPF: string;
  NOME: string;
  "NOME-MAE": string;
  "DATA-NASCIMENTO": string;
  "SITUCAO-CPF": string;
  SIGNO?: string;
  SEXO?: string;
  OBITO?: string;
  "REGIAO-ORIGEM-CPF"?: string;
  "DATA-ATUALIZACAO-CPF"?: string;
  NACIONALIDADE?: string;
  "NUMERO-RG"?: string;
  "ORGAO-EXPEDIDOR-RG"?: string;
  "DATA-EMISSAO-RG"?: string;
  "UF-RG"?: string;
  "GRAU-INSTRUCAO"?: string;
  "QUANTIDADE-DEPENDENTE"?: string;
  "ESTADO-CIVIL"?: string;
  "NUMERO-TITULO-ELEITOR"?: string;
  "PESSOA-POLITICAMENTE-EXPOSTA"?: boolean;
};

interface ValidaIdRequiredProps {
  id: number;
  name: string;
  cpf: string;
  mother: string;
  birth: string;
  cpfStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

type ValidaIdOptionalProps = {
  // CADASTRO-COMPLETO
  sign: string | null;
  gender: string | null;
  death: string | null;
  region: string | null;
  lastUpdate: string | null;
  citizenship: string | null; // NACIONALIDADE
  idNumber: string | null; // NUMERO-RG
  idAgency: string | null; // ORGAO-EXPEDIDOR-RG
  idDate: string | null; // DATA-EMISSAO-RG
  idState: string | null; // UF-RG
  education: string | null; // GRAU-INSTRUCAO
  dependents: string | null; // QUANTIDADE-DEPENDENTE
  marital: string | null; // ESTADO-CIVIL
  voterRegistration: string | null; // NUMERO-TITULO-ELEITOR
  politicallyExposed: boolean | null;
  // LOCALIZACAO
  email: string | null;
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  zip: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  // QUALIFICACAO
  deathDate: string | null;
};

type ValidaId = ValidaIdRequiredProps & ValidaIdOptionalProps;

type ValidaIdData = Partial<ValidaIdOptionalProps> &
  Omit<ValidaIdRequiredProps, "id" | "createdAt" | "updatedAt">;

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
};

function formatDate(dateStr?: string): string {
  if (!dateStr) {
    return "";
  }
  const transformedDate = moment(dateStr, "DD/MM/YYYY").format("YYYY-MM-DD");
  return transformedDate;
}

function extractAddressInfo(addressInfo: AddressInfo) {
  return {
    email: addressInfo.EMAIL || null,
    address: addressInfo.LOGRADOURO || null,
    number: addressInfo.NUMERO?.toString() || null,
    complement: addressInfo.COMPLEMENTO || null,
    neighborhood: addressInfo.BAIRRO || null,
    state: addressInfo.UF || null,
    city: addressInfo.CIDADE || null,
    zip: addressInfo.CEP?.toString() || null,
  };
}

function extractUserData(validaId: any): ValidaIdData {
  try {
    const basicInfo: BasicInfo =
      validaId.RESPOSTA.CONSULTACADASTRAL["CADASTRO-COMPLETO"];
    const user: ValidaIdData = {
      cpf: basicInfo.CPF.toString(),
      name: basicInfo.NOME,
      mother: basicInfo["NOME-MAE"],
      birth: formatDate(basicInfo["DATA-NASCIMENTO"]),
      cpfStatus: basicInfo["SITUCAO-CPF"],
      sign: basicInfo.SIGNO,
      gender: basicInfo.SEXO,
      death: basicInfo.OBITO,
      region: basicInfo["REGIAO-ORIGEM-CPF"],
      lastUpdate: formatDate(basicInfo["DATA-ATUALIZACAO-CPF"]),
      citizenship: basicInfo.NACIONALIDADE,
      idNumber: basicInfo["NUMERO-RG"],
      idAgency: basicInfo["ORGAO-EXPEDIDOR-RG"],
      idDate: formatDate(basicInfo["DATA-EMISSAO-RG"]),
      idState: basicInfo["UF-RG"],
      education: basicInfo["GRAU-INSTRUCAO"],
      dependents: basicInfo["QUANTIDADE-DEPENDENTE"],
      marital: basicInfo["ESTADO-CIVIL"],
      voterRegistration: basicInfo["NUMERO-TITULO-ELEITOR"],
      politicallyExposed: basicInfo["PESSOA-POLITICAMENTE-EXPOSTA"],
    };

    const locationInfo =
      validaId.RESPOSTA.CONSULTACADASTRAL["LOCALIZACAO-COMPLETO"];

    if (Array.isArray(locationInfo.ENDERECO)) {
      const addressInfo: AddressInfo = locationInfo.ENDERECO[0] || {};
      Object.assign(user, extractAddressInfo(addressInfo));
    } else if (locationInfo) {
      const addressInfo: AddressInfo = locationInfo.ENDERECO || {};
      Object.assign(user, extractAddressInfo(addressInfo));
      // ... other address-related properties
    }

    const contactInfo =
      validaId.RESPOSTA.CONSULTACADASTRAL["LOCALIZACAO-COMPLETO"];

    if (Array.isArray(contactInfo.TELEFONE)) {
      const phoneList = contactInfo.TELEFONE.filter(
        (i: any) => i.TIPO === "CELULAR"
      ).map(
        (item: any) =>
          `${item?.DDD?.toString() || ""}${item?.NUMERO?.toString() || ""}`
      );
      const telList = contactInfo.TELEFONE.filter(
        (i: any) => i.TIPO !== "CELULAR"
      ).map(
        (item: any) =>
          `${item?.DDD?.toString() || ""}${item?.NUMERO?.toString() || ""}`
      );
      Object.assign(user, {
        phone: phoneList.toString(),
        tel: telList.toString(),
      });
    } else if (contactInfo.TELEFONE) {
      const phoneInfo =
        contactInfo.TELEFONE.TIPO === "CELULAR"
          ? `${contactInfo.TELEFONE?.DDD?.toString() || ""}${
              contactInfo.TELEFONE?.NUMERO?.toString() || ""
            }`
          : "";
      const telInfo =
        contactInfo.TELEFONE.TIPO === "FIXO"
          ? `${contactInfo.TELEFONE?.DDD?.toString() || ""}${
              contactInfo.TELEFONE?.NUMERO?.toString() || ""
            }`
          : "";
      Object.assign(user, { phone: phoneInfo, tel: telInfo });
    } else {
      Object.assign(user, { phone: "", tel: "" });
    }

    if (Array.isArray(contactInfo.EMAIL)) {
      const emailList = contactInfo.EMAIL.map((item: any) => item || "");
      Object.assign(user, { email: emailList.toString() });
    } else if (contactInfo.EMAIL) {
      Object.assign(user, { email: contactInfo.EMAIL });
    } else {
      Object.assign(user, { email: "" });
    }

    return user;
  } catch (error) {
    console.error("Error in extractUserData:", error);
    throw error;
  }
}

async function fetchUserData(cpf: string) {
  return { name: "John Doe" };
  try {
    const response = await axios.get(`https://api.example.com/users/${cpf}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for user ${cpf}: ${error}`);
    return {}; // Return an empty object if there's an error
  }
}

async function fetchValidaId(cpf: string) {
  const data = {
    VERSAO: "20220225",
    "S-REGIONAL": config.validaIdRegional,
    "S-CODIGO": config.validaIdCodigo,
    "S-SENHA": config.validaIdSenha,
    "S-CONSULTA": config.validaIdConsulta,
    "S-SOLICITANTE": "",
    "S-CPF": cpf,
    "S-CADASTRO-COMPLETO": config.validaIdCadastroCompleto,
    "S-CADASTRO-BASICO": config.validaIdCadastroBasico,
    "S-LOCALIZACAO": config.validaIdLocalizacao,
    "S-QUALIFICACAO": config.validaIdQualificacao,
  };

  try {
    const response = await axios.post(config.validaIdUrl, qs.stringify(data), {
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const apiJson = response.data;

    const validaId = response.data["SPCA-XML"];
    // const validaId = example['SPCA-XML']

    const user = extractUserData(validaId);

    // Additional validation and checks on user data can be done here

    return Promise.resolve({ user, apiJson });
  } catch (error) {
    return Promise.reject(error);
  }
}

async function processCSV() {
  const users: User[] = [];

  const reader = fs.createReadStream("users.csv").pipe(csv());
  reader.on("data", (row) => {
    users.push({ cpf: row.cpf });
  });
  reader.on("end", async () => {
    for (const [item, user] of users.entries()) {
      try {
        console.log(
          `Fetching data for user ${user.cpf}: (${item + 1}/${users.length})`
        );
        const { user: validaId } = await fetchValidaId(user.cpf);
        // const additionalData = await fetchUserData(user.cpf);
        Object.assign(user, validaId);
      } catch (error) {
        console.log(error);
      }
    }
    const csvWriter = createObjectCsvWriter({
      path: "enhanced_users.csv",
      header: Object.keys(users[0]).map((key) => ({ id: key, title: key })),
    });
    csvWriter
      .writeRecords(users)
      .then(() => {
        console.log("Enhanced users data written to enhanced_users.csv");
      })
      .catch((err) => {
        console.error("Error writing CSV:", err);
      });
  });
}
// console.log(config);

processCSV();
