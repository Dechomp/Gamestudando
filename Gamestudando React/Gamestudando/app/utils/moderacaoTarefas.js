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
  // Primeira barreira de seguranca antes de salvar tarefa criada pelo professor.
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

  if (tarefa.formato === "palavra") {
    return moderarPalavraCosmoletrando(tarefa);
  }

  return reprovar("Formato de tarefa nao reconhecido.");
}

export async function revisarTarefaComIA(questaoId, tarefa) {
  // Chama a funcao do Firebase quando a revisao por IA estiver disponivel.
  const revisarQuestao = httpsCallable(cloudFunctions, "revisarQuestaoProfessor");
  const resposta = await revisarQuestao({
    questaoId,
    tarefa,
  });

  return resposta.data;
}

function moderarMultiplaEscolha(tarefa) {
  // Valida se a pergunta tem conteudo, quatro alternativas e resposta correta.
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
  // Procura sinais simples de que a pergunta realmente e de matematica.
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
  // Procura sinais simples de que a pergunta realmente e de portugues.
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
  // Confere se as duas palavras existem, sao diferentes e parecem rimar.
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

function moderarPalavraCosmoletrando(tarefa) {
  // Valida a palavra que vai virar missao no jogo da nave.
  const palavra = String(
    tarefa.palavra ||
    tarefa.palavraMissao ||
    tarefa.cosmoletrando?.palavra ||
    ""
  ).trim();
  const palavraNormalizada = normalizarPalavra(palavra);

  if (!palavraNormalizada) {
    return reprovar("Preencha a palavra do Cosmoletrando.");
  }

  if (palavraNormalizada.length < 2) {
    return reprovar("A palavra do Cosmoletrando precisa ter pelo menos duas letras.");
  }

  if (palavraNormalizada.length > 10) {
    return reprovar("A palavra do Cosmoletrando deve ter no maximo dez letras.");
  }

  return aprovarLocalmente();
}

function extrairTextos(tarefa) {
  // Junta todos os textos da tarefa para checar conteudo inadequado.
  if (tarefa.formato === "conectar_pares") {
    return [
      tarefa.instrucao,
      tarefa.palavraMissao,
      tarefa.cosmoletrando?.palavra,
      tarefa.esquerda?.texto,
      tarefa.direita?.texto,
      tarefa.palavraA,
      tarefa.palavraB,
    ].filter(Boolean);
  }

  if (tarefa.formato === "palavra") {
    return [
      tarefa.instrucao,
      tarefa.palavra,
      tarefa.palavraMissao,
      tarefa.cosmoletrando?.palavra,
    ].filter(Boolean);
  }

  return [
    tarefa.pergunta,
    ...(tarefa.respostas || []),
  ].filter(Boolean);
}

function normalizarTexto(texto) {
  // Remove acentos e simbolos para facilitar a comparacao.
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
  // Mantem o app funcionando mesmo sem a IA externa aprovar na hora.
  return {
    aprovada: true,
    statusRevisao: "pendente_ia",
    motivo: "Aprovada na verificacao local.",
    origem: "local",
  };
}

function reprovar(motivo) {
  // Padrao de retorno quando alguma regra local bloqueia a tarefa.
  return {
    aprovada: false,
    statusRevisao: "rejeitada",
    motivo,
    origem: "local",
  };
}
