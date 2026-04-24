import { atom } from "jotai";

export interface CobrancaResult {
  html: string;
  dataVencimento: string;
}

interface CobrancaData {
  valor: number;
  pagadorNome: string;
  pagadorTaxNumber: string;
  pagadorEmail: string;
  pagadorTelefone: string;
  pagadorCep: string;
  pagadorBairro: string;
  pagadorRua: string;
  pagadorCidade: string;
  pagadorUf: string;
  pagadorNumero: string;
  dataVencimento: string;
  isRecorrente?: boolean;
  quantidadeMeses?: number;
  results?: CobrancaResult[];
}

export const cobrancaDataAtom = atom<CobrancaData>({
  valor: 0,
  pagadorNome: "",
  pagadorTaxNumber: "",
  pagadorEmail: "",
  pagadorTelefone: "",
  pagadorCep: "",
  pagadorBairro: "",
  pagadorRua: "",
  pagadorCidade: "",
  pagadorUf: "",
  pagadorNumero: "",
  dataVencimento: "",
});

export const cobrancaHtmlAtom = atom<string | null>(null);
