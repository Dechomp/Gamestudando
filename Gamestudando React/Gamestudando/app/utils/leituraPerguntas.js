import * as Speech from "expo-speech";
import { carregarPerfil } from "./perfilAluno";

const LETRA = "A-Za-z\\u00C0-\\u00FF";

export function prepararTextoParaLeitura(texto) {
  let textoPreparado = String(texto);
  const silabaComHifen = new RegExp(`([${LETRA}])\\s*-\\s*([${LETRA}])`, "g");

  while (silabaComHifen.test(textoPreparado)) {
    textoPreparado = textoPreparado.replace(silabaComHifen, "$1, $2");
    silabaComHifen.lastIndex = 0;
  }

  return textoPreparado
    .replace(/\b[A-Z\u00C0-\u00DD]{1,2}\b/g, trecho => trecho.toLowerCase())
    .replace(/\+/g, " mais ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 menos $2")
    .replace(/-/g, " menos ")
    .replace(/=/g, " igual a ")
    .replace(/\?/g, "? ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function lerTextoSeAtivo(texto) {
  try {
    const perfil = await carregarPerfil();
    const leituraAtiva =
      perfil?.configuracoes?.leituraPerguntasAtiva !== false;

    if (!leituraAtiva || !texto) return;

    Speech.stop();
    Speech.speak(prepararTextoParaLeitura(texto), {
      language: "pt-BR",
      pitch: 1,
      rate: 0.9,
    });
  } catch (error) {
    console.log("Erro na leitura da pergunta:", error);
  }
}

export function pararLeitura() {
  Speech.stop();
}
