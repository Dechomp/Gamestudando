import { httpsCallable } from "firebase/functions";

import { cloudFunctions } from "./firebase";
import { parecemRimar, normalizarPalavra } from "./rimas";

const PALAVRAS_BLOQUEADAS = [
  "agredir",
  "agressao",
  "arma",
  "bebida",
  "briga",
  "buceta",
  "caralho",
  "cu",
  "droga",
  "foda",
  "fuder",
  "matar",
  "merda",
  "pau",
  "palavrao",
  "palavroes",
  "piroca",
  "porra",
  "puta",
  "putaria",
  "sexo",
  "tiro",
  "violencia",
  "xingar",
  "xingamento",
];

export function moderarTarefaLocalmente(tarefa) {
  const textos = extrairTextos(tarefa);
  const textoCompleto = normalizarTexto(textos.join(" "));

  if (!textoCompleto.trim()) {
    return reprovar("A tarefa precisa ter conteudo.");
  }

  const palavraBloqueada = PALAVRAS_BLOQUEADAS.find(palavra =>
    textoCompleto.includes(` ${palavra} `)
  );

  if (palavraBloqueada) {
    return reprovar("A tarefa contem palavra inadequada para criancas.");
  }

  if (tarefa.formato === "multipla_escolha") {
    return moderarMultiplaEscolha(tarefa);
  }

  if (tarefa.formato === "conectar_pares") {
    return moderarRima(tarefa);
  }

  return reprovar("Formato de tarefa nao reconhecido.");
}

export async function revisarTarefaComIA(questaoId, tarefa) {
  const revisarQuestao = httpsCallable(cloudFunctions, "revisarQuestaoProfessor");
  const resposta = await revisarQuestao({
    questaoId,
    tarefa,
  });

  return resposta.data;
}

function moderarMultiplaEscolha(tarefa) {
  const pergunta = String(tarefa.pergunta || "").trim();
  const respostas = tarefa.respostas || [];
  const perguntaNormalizada = normalizarPalavra(pergunta);

  if (pergunta.length < 4) {
    return reprovar("A pergunta esta curta demais.");
  }

  if (tarefa.materia === "matematica" && !parecePerguntaMatematica(perguntaNormalizada)) {
    return reprovar("A pergunta de matematica precisa envolver numeros, quantidade ou comparacao.");
  }

  if (tarefa.materia === "portugues" && !parecePerguntaPortugues(perguntaNormalizada)) {
    return reprovar("A pergunta de portugues precisa envolver letras, silabas, palavras ou leitura.");
  }

  if (!Array.isArray(respostas) || respostas.length < 4) {
    return reprovar("A tarefa precisa ter quatro respostas.");
  }

  if (respostas.some(resposta => !String(resposta).trim())) {
    return reprovar("Todas as respostas precisam estar preenchidas.");
  }

  if (new Set(respostas.map(normalizarTexto)).size !== respostas.length) {
    return reprovar("As respostas nao podem ser repetidas.");
  }

  if (!Number.isInteger(tarefa.correta) || !respostas[tarefa.correta]) {
    return reprovar("A resposta correta precisa ser valida.");
  }

  return aprovarLocalmente();
}

function parecePerguntaMatematica(texto) {
  return (
    /\d/.test(texto) ||
    texto.includes("quant") ||
    texto.includes("soma") ||
    texto.includes("some") ||
    texto.includes("subtra") ||
    texto.includes("menos") ||
    texto.includes("maior") ||
    texto.includes("menor") ||
    texto.includes("numero") ||
    texto.includes("conta")
  );
}

function parecePerguntaPortugues(texto) {
  return (
    texto.includes("letra") ||
    texto.includes("silaba") ||
    texto.includes("palavra") ||
    texto.includes("rima") ||
    texto.includes("comeca") ||
    texto.includes("termina") ||
    texto.includes("som") ||
    texto.includes("vogal") ||
    texto.includes("consoante") ||
    texto.includes("leia")
  );
}

function moderarRima(tarefa) {
  const esquerda = tarefa.esquerda?.texto || tarefa.palavraA || "";
  const direita = tarefa.direita?.texto || tarefa.palavraB || "";

  if (!esquerda.trim() || !direita.trim()) {
    return reprovar("Preencha as duas palavras da rima.");
  }

  if (normalizarPalavra(esquerda) === normalizarPalavra(direita)) {
    return reprovar("Use duas palavras diferentes.");
  }

  if (!parecemRimar(esquerda, direita)) {
    return reprovar("Essas palavras nao parecem rimar.");
  }

  return aprovarLocalmente();
}

function extrairTextos(tarefa) {
  if (tarefa.formato === "conectar_pares") {
    return [
      tarefa.instrucao,
      tarefa.esquerda?.texto,
      tarefa.direita?.texto,
      tarefa.palavraA,
      tarefa.palavraB,
    ].filter(Boolean);
  }

  return [
    tarefa.pergunta,
    ...(tarefa.respostas || []),
  ].filter(Boolean);
}

function normalizarTexto(texto) {
  return ` ${String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()} `;
}

function aprovarLocalmente() {
  return {
    aprovada: true,
    statusRevisao: "pendente_ia",
    motivo: "Aprovada na verificacao local.",
    origem: "local",
  };
}

function reprovar(motivo) {
  return {
    aprovada: false,
    statusRevisao: "rejeitada",
    motivo,
    origem: "local",
  };
}
