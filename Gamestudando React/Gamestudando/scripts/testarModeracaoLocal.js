const palavrasBloqueadas = [
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

const casos = [
  {
    nome: "bloqueia palavrao generico",
    esperado: false,
    tarefa: {
      materia: "matematica",
      formato: "multipla_escolha",
      pergunta: "Quanto e 2 + 2?",
      respostas: ["4", "Briga", "Palavrão", "8"],
      correta: 0,
    },
  },
  {
    nome: "bloqueia pergunta matematica sem matematica",
    esperado: false,
    tarefa: {
      materia: "matematica",
      formato: "multipla_escolha",
      pergunta: "Coll",
      respostas: ["Gelado", "Briga", "Palavrão", "Distorcido"],
      correta: 0,
    },
  },
  {
    nome: "aprova matematica simples",
    esperado: true,
    tarefa: {
      materia: "matematica",
      formato: "multipla_escolha",
      pergunta: "Quanto e 2 + 2?",
      respostas: ["4", "3", "5", "6"],
      correta: 0,
    },
  },
  {
    nome: "aprova portugues simples",
    esperado: true,
    tarefa: {
      materia: "portugues",
      formato: "multipla_escolha",
      pergunta: "Qual palavra comeca com B?",
      respostas: ["BOLA", "CASA", "DADO", "FACA"],
      correta: 0,
    },
  },
  {
    nome: "bloqueia rima suspeita",
    esperado: false,
    tarefa: {
      materia: "rimas",
      formato: "conectar_pares",
      palavraA: "PATO",
      palavraB: "CASA",
    },
  },
];

let falhas = 0;

casos.forEach((caso) => {
  const resultado = moderar(caso.tarefa);
  const passou = resultado.aprovada === caso.esperado;

  if (!passou) falhas += 1;

  console.log(`${passou ? "OK" : "FALHOU"} - ${caso.nome}`);
  console.log(`  esperado: ${caso.esperado ? "aprovar" : "bloquear"}`);
  console.log(`  resultado: ${resultado.aprovada ? "aprovou" : "bloqueou"} - ${resultado.motivo}`);
});

if (falhas > 0) {
  process.exitCode = 1;
}

function moderar(tarefa) {
  const textos = extrairTextos(tarefa);
  const textoCompleto = normalizarTexto(textos.join(" "));

  const palavraBloqueada = palavrasBloqueadas.find((palavra) =>
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

function moderarMultiplaEscolha(tarefa) {
  const pergunta = String(tarefa.pergunta || "").trim();
  const respostas = tarefa.respostas || [];
  const perguntaNormalizada = normalizarPalavra(pergunta);

  if (pergunta.length < 4) return reprovar("A pergunta esta curta demais.");

  if (tarefa.materia === "matematica" && !parecePerguntaMatematica(perguntaNormalizada)) {
    return reprovar("A pergunta de matematica precisa envolver numeros, quantidade ou comparacao.");
  }

  if (tarefa.materia === "portugues" && !parecePerguntaPortugues(perguntaNormalizada)) {
    return reprovar("A pergunta de portugues precisa envolver letras, silabas, palavras ou leitura.");
  }

  if (!Array.isArray(respostas) || respostas.length < 4) {
    return reprovar("A tarefa precisa ter quatro respostas.");
  }

  if (respostas.some((resposta) => !String(resposta).trim())) {
    return reprovar("Todas as respostas precisam estar preenchidas.");
  }

  if (new Set(respostas.map(normalizarTexto)).size !== respostas.length) {
    return reprovar("As respostas nao podem ser repetidas.");
  }

  if (!Number.isInteger(tarefa.correta) || !respostas[tarefa.correta]) {
    return reprovar("A resposta correta precisa ser valida.");
  }

  return aprovar();
}

function moderarRima(tarefa) {
  const esquerda = tarefa.esquerda?.texto || tarefa.palavraA || "";
  const direita = tarefa.direita?.texto || tarefa.palavraB || "";

  if (!parecemRimar(esquerda, direita)) {
    return reprovar("Essas palavras nao parecem rimar.");
  }

  return aprovar();
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

  return [tarefa.pergunta, ...(tarefa.respostas || [])].filter(Boolean);
}

function parecePerguntaMatematica(texto) {
  return /\d/.test(texto) || texto.includes("quant") || texto.includes("maior") || texto.includes("menor");
}

function parecePerguntaPortugues(texto) {
  return texto.includes("letra") || texto.includes("silaba") || texto.includes("palavra") || texto.includes("rima") || texto.includes("comeca");
}

function parecemRimar(palavraA, palavraB) {
  const a = normalizarPalavra(palavraA);
  const b = normalizarPalavra(palavraB);

  return a.length >= 2 && b.length >= 2 && (a.slice(-3) === b.slice(-3) || a.slice(-2) === b.slice(-2));
}

function normalizarTexto(texto) {
  return ` ${normalizarPalavra(texto)} `;
}

function normalizarPalavra(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function aprovar() {
  return { aprovada: true, motivo: "Aprovada." };
}

function reprovar(motivo) {
  return { aprovada: false, motivo };
}
