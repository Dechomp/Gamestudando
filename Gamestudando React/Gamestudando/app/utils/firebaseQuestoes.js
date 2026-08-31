import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { perguntasMatematica } from "../perguntasMatematicaQuiz4";
import { perguntasPortugues } from "../perguntasPortuguesQuiz4";
import { perguntasMaker } from "../perguntasMaker";
import {
    palavrasDireita,
    palavrasEsquerda
} from "../perguntasQuizRimas";
import { db } from "./firebase";

export async function semearPerguntasIniciaisFirebase() {
  const questoes = [
    ...montarQuestoesMultiplaEscolha("matematica", perguntasMatematica),
    ...montarQuestoesMultiplaEscolha("portugues", perguntasPortugues),
    ...montarQuestoesMultiplaEscolha("maker", perguntasMaker),
    ...montarQuestoesRimas()
  ];

  const lotes = dividirEmLotes(questoes, 450);

  for (const lote of lotes) {
    const batch = writeBatch(db);

    lote.forEach(questao => {
      batch.set(
        doc(db, "questoes", questao.id),
        {
          ...questao,
          atualizadoEm: serverTimestamp(),
        },
        { merge: true }
      );
    });

    await batch.commit();
  }

  return questoes.length;
}

function montarQuestoesMultiplaEscolha(materia, perguntas) {
  return perguntas.map((pergunta, index) => ({
    id: `sistema_${materia}_${String(index + 1).padStart(3, "0")}`,
    materia,
    formato: "multipla_escolha",
    tipoQuestao: inferirTipoQuestao(pergunta.pergunta, materia),
    pergunta: pergunta.pergunta,
    respostas: pergunta.respostas,
    correta: pergunta.correta,
    nivel: pergunta.nivel,
    ativa: true,
    statusRevisao: "aprovada",
    criadaPor: "sistema",
    origem: "base_inicial",
    criadoEm: serverTimestamp(),
  }));
}

function montarQuestoesRimas() {
  return palavrasEsquerda
    .map(esquerda => {
      const direita = palavrasDireita.find(item => item.grupo === esquerda.grupo);

      if (!direita) return null;

      return {
        id: `sistema_rimas_${String(esquerda.par).padStart(3, "0")}`,
        materia: "rimas",
        formato: "conectar_pares",
        tipoQuestao: "rima",
        instrucao: "Conecte as palavras que rimam.",
        par: esquerda.par,
        grupo: esquerda.grupo,
        esquerda: {
          texto: esquerda.texto,
          nivel: esquerda.nivel,
        },
        direita: {
          texto: direita.texto,
          nivel: direita.nivel,
        },
        nivel: Math.max(esquerda.nivel || 1, direita.nivel || 1),
        ativa: true,
        statusRevisao: "aprovada",
        criadaPor: "sistema",
        origem: "base_inicial",
        criadoEm: serverTimestamp(),
      };
    })
    .filter(Boolean);
}

function inferirTipoQuestao(texto, materia) {
  const normalizado = String(texto).toLowerCase();

  if (materia === "matematica") {
    if (normalizado.includes("+")) return "soma";
    if (normalizado.includes("-")) return "subtracao";
    if (normalizado.includes("maior")) return "comparacao_maior";
    if (normalizado.includes("menor")) return "comparacao_menor";
    return "matematica";
  }

  if (normalizado.includes("quantas")) return "silabas";
  if (normalizado.includes("rima")) return "rima";
  if (normalizado.includes("comeca") || normalizado.includes("começa")) {
    return "letra_ou_silaba_inicial";
  }
  if (normalizado.includes("termina")) return "final_da_palavra";
  if (normalizado.includes("nao rima") || normalizado.includes("não rima")) {
    return "intruso_rima";
  }

  return materia;
}

function dividirEmLotes(lista, tamanho) {
  const lotes = [];

  for (let i = 0; i < lista.length; i += tamanho) {
    lotes.push(lista.slice(i, i + tamanho));
  }

  return lotes;
}
