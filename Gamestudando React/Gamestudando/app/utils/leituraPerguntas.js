import * as Speech from "expo-speech";
import { carregarPerfil } from "./perfilAluno";

function prepararTextoParaLeitura(texto) {
  let textoPreparado = String(texto);

  while (/[A-Za-zÀ-ÿ]\s*-\s*[A-Za-zÀ-ÿ]/.test(textoPreparado)) {
    textoPreparado = textoPreparado.replace(
      /([A-Za-zÀ-ÿ])\s*-\s*([A-Za-zÀ-ÿ])/g,
      "$1, $2"
    );
  }

  return textoPreparado
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
