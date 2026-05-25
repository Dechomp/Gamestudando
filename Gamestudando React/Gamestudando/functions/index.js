const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();

const db = admin.firestore();

exports.revisarQuestaoProfessor = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Faca login para revisar uma tarefa."
    );
  }

  const questaoId = data?.questaoId;

  if (!questaoId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Informe o id da questao."
    );
  }

  const ref = db.collection("questoes").doc(questaoId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Tarefa nao encontrada."
    );
  }

  const questao = snap.data();
  await validarPermissaoProfessor(context.auth.uid, questao);

  const textoModeracao = montarTextoModeracao(questao);
  const revisaoLocal = revisarPedagogicamenteLocal(questao);

  if (!revisaoLocal.aprovada) {
    await salvarRevisao(ref, {
      statusRevisao: "rejeitada",
      ativa: false,
      revisao: {
        origem: "local_pedagogica",
        status: "rejeitada",
        motivo: revisaoLocal.motivo,
        detalhes: revisaoLocal.detalhes,
      },
    });

    return {
      aprovada: false,
      statusRevisao: "rejeitada",
      motivo: revisaoLocal.motivo,
    };
  }

  const revisaoOpenAI = await revisarSegurancaOpenAI(textoModeracao);

  if (revisaoOpenAI.status === "rejeitada") {
    await salvarRevisao(ref, {
      statusRevisao: "rejeitada",
      ativa: false,
      revisao: {
        origem: "openai_moderation",
        status: "rejeitada",
        motivo: revisaoOpenAI.motivo,
        categorias: revisaoOpenAI.categorias,
      },
    });

    return {
      aprovada: false,
      statusRevisao: "rejeitada",
      motivo: revisaoOpenAI.motivo,
    };
  }

  const revisaoGemini = await revisarPedagogicamenteGemini(questao);

  if (revisaoGemini.status === "rejeitada") {
    await salvarRevisao(ref, {
      statusRevisao: "rejeitada",
      ativa: false,
      revisao: {
        origem: "gemini_pedagogica",
        status: "rejeitada",
        motivo: revisaoGemini.motivo,
        sugestoes: revisaoGemini.sugestoes || [],
      },
    });

    return {
      aprovada: false,
      statusRevisao: "rejeitada",
      motivo: revisaoGemini.motivo,
    };
  }

  const origem = [
    revisaoOpenAI.origem,
    revisaoGemini.origem,
    "local_pedagogica",
  ].filter(Boolean);

  await salvarRevisao(ref, {
    statusRevisao: "aprovada",
    ativa: true,
    revisao: {
      origem: origem.join("+"),
      status: "aprovada",
      motivo: revisaoGemini.motivo || revisaoOpenAI.motivo || revisaoLocal.motivo,
      avisos: [
        ...(revisaoOpenAI.avisos || []),
        ...(revisaoGemini.avisos || []),
      ],
    },
  });

  return {
    aprovada: true,
    statusRevisao: "aprovada",
    motivo: "Tarefa aprovada pela revisao automatica.",
  };
});

async function validarPermissaoProfessor(uid, questao) {
  if (questao.criadaPor === uid) return;

  const usuario = await db.collection("usuarios").doc(uid).get();
  const tipo = usuario.data()?.tipo;

  if (tipo === "professor_admin" || tipo === "admin") return;

  throw new functions.https.HttpsError(
    "permission-denied",
    "Voce nao pode revisar esta tarefa."
  );
}

async function salvarRevisao(ref, dados) {
  await ref.update({
    ...dados,
    "revisao.atualizadoEm": admin.firestore.FieldValue.serverTimestamp(),
    atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function revisarSegurancaOpenAI(texto) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      status: "ignorada",
      origem: "openai_moderation_indisponivel",
      motivo: "OpenAI Moderation nao configurada.",
      avisos: ["OPENAI_API_KEY ausente."],
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "omni-moderation-latest",
        input: texto,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI moderation erro ${response.status}: ${body}`);
    }

    const json = await response.json();
    const resultado = json.results?.[0];

    if (resultado?.flagged) {
      return {
        status: "rejeitada",
        origem: "openai_moderation",
        motivo: "Conteudo inadequado para criancas.",
        categorias: resultado.categories,
      };
    }

    return {
      status: "aprovada",
      origem: "openai_moderation",
      motivo: "Conteudo passou pela verificacao de seguranca.",
    };
  } catch (error) {
    console.error(error);

    return {
      status: "ignorada",
      origem: "openai_moderation_erro",
      motivo: "Nao foi possivel consultar a OpenAI Moderation.",
      avisos: [error.message],
    };
  }
}

async function revisarPedagogicamenteGemini(questao) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey || !model) {
    return {
      status: "ignorada",
      origem: "gemini_indisponivel",
      motivo: "Gemini pedagogico nao configurado.",
      avisos: ["GEMINI_API_KEY ou GEMINI_MODEL ausente."],
    };
  }

  try {
    const prompt = montarPromptPedagogico(questao);
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
      `?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini erro ${response.status}: ${body}`);
    }

    const json = await response.json();
    const texto = json.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const resultado = JSON.parse(texto);

    return {
      status: resultado.aprovada ? "aprovada" : "rejeitada",
      origem: "gemini_pedagogica",
      motivo: resultado.motivo || "Revisao pedagogica concluida.",
      sugestoes: Array.isArray(resultado.sugestoes) ? resultado.sugestoes : [],
    };
  } catch (error) {
    console.error(error);

    return {
      status: "ignorada",
      origem: "gemini_erro",
      motivo: "Nao foi possivel consultar a revisao pedagogica por IA.",
      avisos: [error.message],
    };
  }
}

function revisarPedagogicamenteLocal(questao) {
  if (!questao.materia || !questao.formato) {
    return reprovar("A tarefa precisa ter materia e formato.");
  }

  if (!Number.isFinite(Number(questao.nivel)) || Number(questao.nivel) < 1) {
    return reprovar("O nivel da tarefa e invalido.");
  }

  if (questao.formato === "conectar_pares") {
    return revisarRimaLocal(questao);
  }

  if (questao.formato === "multipla_escolha") {
    return revisarMultiplaEscolhaLocal(questao);
  }

  return reprovar("Formato de tarefa nao reconhecido.");
}

function revisarMultiplaEscolhaLocal(questao) {
  const respostas = questao.respostas || [];

  if (!questao.pergunta || questao.pergunta.trim().length < 4) {
    return reprovar("A pergunta esta curta demais.");
  }

  if (!Array.isArray(respostas) || respostas.length < 4) {
    return reprovar("A tarefa precisa ter quatro respostas.");
  }

  if (respostas.some(resposta => !String(resposta).trim())) {
    return reprovar("Todas as respostas precisam estar preenchidas.");
  }

  if (!Number.isInteger(questao.correta) || !respostas[questao.correta]) {
    return reprovar("A resposta correta nao foi marcada corretamente.");
  }

  const respostaCalculada = calcularRespostaMatematica(questao.pergunta);

  if (respostaCalculada !== null) {
    const respostaMarcada = Number(String(respostas[questao.correta]).replace(",", "."));

    if (Number.isFinite(respostaMarcada) && respostaMarcada !== respostaCalculada) {
      return reprovar(
        "A resposta marcada nao bate com o resultado da conta.",
        { esperada: respostaCalculada, marcada: respostaMarcada }
      );
    }
  }

  return aprovar("A tarefa passou pela verificacao pedagogica local.");
}

function revisarRimaLocal(questao) {
  const esquerda = questao.esquerda?.texto || "";
  const direita = questao.direita?.texto || "";

  if (!esquerda || !direita) {
    return reprovar("A rima precisa ter duas palavras.");
  }

  if (normalizarPalavra(esquerda) === normalizarPalavra(direita)) {
    return reprovar("A rima precisa usar duas palavras diferentes.");
  }

  if (!parecemRimar(esquerda, direita)) {
    return reprovar("As palavras nao parecem rimar.");
  }

  return aprovar("A rima passou pela verificacao pedagogica local.");
}

function calcularRespostaMatematica(pergunta) {
  const match = String(pergunta).match(/(\d+)\s*([+-])\s*(\d+)/);

  if (!match) return null;

  const primeiro = Number(match[1]);
  const operador = match[2];
  const segundo = Number(match[3]);

  if (operador === "+") return primeiro + segundo;
  if (operador === "-") return primeiro - segundo;

  return null;
}

function montarTextoModeracao(questao) {
  if (questao.formato === "conectar_pares") {
    return [
      questao.instrucao || "Conecte as palavras que rimam.",
      questao.esquerda?.texto,
      questao.direita?.texto,
    ].filter(Boolean).join("\n");
  }

  return [
    questao.pergunta,
    ...(questao.respostas || []),
  ].filter(Boolean).join("\n");
}

function montarPromptPedagogico(questao) {
  return [
    "Voce revisa atividades para criancas brasileiras do 1 ano em alfabetizacao.",
    "Avalie se a atividade e correta, clara, segura e adequada para criancas.",
    "Responda somente JSON valido no formato:",
    '{"aprovada":true,"motivo":"texto curto","sugestoes":[]}',
    "",
    "Tarefa:",
    JSON.stringify(questao),
  ].join("\n");
}

function parecemRimar(palavraA, palavraB) {
  const a = normalizarPalavra(palavraA);
  const b = normalizarPalavra(palavraB);

  if (a.length < 2 || b.length < 2) return false;

  return a.slice(-3) === b.slice(-3) || a.slice(-2) === b.slice(-2);
}

function normalizarPalavra(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function aprovar(motivo) {
  return {
    aprovada: true,
    motivo,
  };
}

function reprovar(motivo, detalhes = null) {
  return {
    aprovada: false,
    motivo,
    detalhes,
  };
}
