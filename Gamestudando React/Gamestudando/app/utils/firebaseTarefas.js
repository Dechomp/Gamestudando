import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";

import { auth, db } from "./firebase";
import {
    moderarTarefaLocalmente,
    revisarTarefaComIA
} from "./moderacaoTarefas";
import { normalizarPalavra } from "./rimas";

export async function criarQuestaoMultiplaEscolhaProfessor({
  materia,
  pergunta,
  respostas,
  correta,
  nivel
}) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const dadosQuestao = {
    materia,
    formato: "multipla_escolha",
    tipoQuestao: inferirTipoQuestao(pergunta, materia),
    pergunta: pergunta.trim(),
    respostas: respostas.map(resposta => resposta.trim()),
    correta,
    nivel: Number(nivel),
  };

  validarModeracaoLocal(dadosQuestao);

  const docRef = await addDoc(collection(db, "questoes"), {
    ...dadosQuestao,
    ...dadosRevisaoPendente(),
    criadaPor: usuario.uid,
    origem: "professor",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  solicitarRevisaoIA(docRef.id, dadosQuestao);

  return docRef.id;
}

export async function criarQuestaoRimaProfessor({
  palavraA,
  palavraB,
  palavraMissao,
  nivel
}) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const primeira = palavraA.trim().toUpperCase();
  const segunda = palavraB.trim().toUpperCase();
  const palavraCosmoletrando = String(palavraMissao || primeira).trim().toUpperCase();
  const chavePar = montarChaveParRima(primeira, segunda);
  const jaExiste = await verificarParRimaExistente(chavePar, primeira, segunda);

  if (jaExiste) {
    throw new Error("RIMA_DUPLICADA");
  }

  const dadosQuestao = {
    materia: "rimas",
    formato: "conectar_pares",
    tipoQuestao: "rima",
    instrucao: "Conecte as palavras que rimam.",
    par: chavePar,
    grupo: chavePar,
    chavePar,
    esquerda: {
      texto: primeira,
      nivel: Number(nivel),
    },
    direita: {
      texto: segunda,
      nivel: Number(nivel),
    },
    palavraMissao: palavraCosmoletrando,
    cosmoletrando: {
      palavra: palavraCosmoletrando,
    },
    nivel: Number(nivel),
  };

  validarModeracaoLocal(dadosQuestao);

  const docRef = await addDoc(collection(db, "questoes"), {
    ...dadosQuestao,
    ...dadosRevisaoPendente(),
    criadaPor: usuario.uid,
    origem: "professor",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  solicitarRevisaoIA(docRef.id, dadosQuestao);

  return docRef.id;
}

export async function criarQuestaoCosmoletrando({
  palavra,
  nivel
}) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const palavraNormalizada = palavra.trim().toUpperCase();

  const dadosQuestao = {
    materia: "cosmoletrando",
    formato: "palavra",
    tipoQuestao: "cosmoletrando",
    instrucao: "Forme a palavra usando as letras.",
    palavra: palavraNormalizada,
    palavraMissao: palavraNormalizada,
    cosmoletrando: {
      palavra: palavraNormalizada,
    },
    nivel: Number(nivel),
  };

  validarModeracaoLocal(dadosQuestao);

  const docRef = await addDoc(collection(db, "questoes"), {
    ...dadosQuestao,
    ...dadosRevisaoPendente(),
    criadaPor: usuario.uid,
    origem: "professor",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  solicitarRevisaoIA(docRef.id, dadosQuestao);

  return docRef.id;
}

export async function atualizarQuestaoProfessor(id, dados) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const atualizacao = montarDadosAtualizacao(dados);

  if (atualizacao.materia === "rimas") {
    const primeira = atualizacao.esquerda.texto;
    const segunda = atualizacao.direita.texto;
    const jaExiste = await verificarParRimaExistente(
      atualizacao.chavePar,
      primeira,
      segunda,
      id
    );

    if (jaExiste) {
      throw new Error("RIMA_DUPLICADA");
    }
  }

  validarModeracaoLocal(atualizacao);

  await updateDoc(doc(db, "questoes", id), {
    ...atualizacao,
    ...dadosRevisaoPendente(),
    atualizadoEm: serverTimestamp(),
  });

  solicitarRevisaoIA(id, atualizacao);
}

export async function excluirQuestaoProfessor(id) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  await deleteDoc(doc(db, "questoes", id));
}

export async function listarQuestoesDoProfessor() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const consulta = query(
    collection(db, "questoes"),
    where("criadaPor", "==", usuario.uid)
  );

  const snap = await getDocs(consulta);

  return snap.docs
    .map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .sort((a, b) => {
      const dataA = a.criadoEm?.seconds || 0;
      const dataB = b.criadoEm?.seconds || 0;
      return dataB - dataA;
    });
}

async function verificarParRimaExistente(chavePar, palavraA, palavraB, ignorarId = null) {
  const porChave = query(
    collection(db, "questoes"),
    where("materia", "==", "rimas"),
    where("chavePar", "==", chavePar)
  );

  const snapChave = await getDocs(porChave);

  if (snapChave.docs.some(docSnap => docSnap.id !== ignorarId)) return true;

  const rimas = query(
    collection(db, "questoes"),
    where("materia", "==", "rimas"),
    where("formato", "==", "conectar_pares")
  );

  const snapRimas = await getDocs(rimas);
  const chaveNova = montarChaveParRima(palavraA, palavraB);

  return snapRimas.docs.some(docSnap => {
    if (docSnap.id === ignorarId) return false;

    const dados = docSnap.data();
    const esquerda = dados?.esquerda?.texto;
    const direita = dados?.direita?.texto;

    if (!esquerda || !direita) return false;

    return montarChaveParRima(esquerda, direita) === chaveNova;
  });
}

function montarDadosAtualizacao(dados) {
  if (dados.materia === "rimas") {
    const primeira = dados.palavraA.trim().toUpperCase();
    const segunda = dados.palavraB.trim().toUpperCase();
    const chavePar = montarChaveParRima(primeira, segunda);

    return {
      materia: "rimas",
      formato: "conectar_pares",
      tipoQuestao: "rima",
      instrucao: "Conecte as palavras que rimam.",
      par: chavePar,
      grupo: chavePar,
      chavePar,
      esquerda: {
        texto: primeira,
        nivel: Number(dados.nivel),
      },
      direita: {
        texto: segunda,
        nivel: Number(dados.nivel),
      },
      palavraMissao: String(dados.palavraMissao || primeira).trim().toUpperCase(),
      cosmoletrando: {
        palavra: String(dados.palavraMissao || primeira).trim().toUpperCase(),
      },
      nivel: Number(dados.nivel),
    };
  }

  return {
    materia: dados.materia,
    formato: "multipla_escolha",
    tipoQuestao: inferirTipoQuestao(dados.pergunta, dados.materia),
    pergunta: dados.pergunta.trim(),
    respostas: dados.respostas.map(resposta => resposta.trim()),
    correta: Number(dados.correta),
    nivel: Number(dados.nivel),
  };
}

function validarModeracaoLocal(dadosQuestao) {
  const resultado = moderarTarefaLocalmente(dadosQuestao);

  if (!resultado.aprovada) {
    const error = new Error("MODERACAO_LOCAL");
    error.motivo = resultado.motivo;
    throw error;
  }
}

function dadosRevisaoPendente() {
  return {
    ativa: true,
    statusRevisao: "aprovada",
    revisao: {
      status: "aprovada",
      origem: "local",
      motivo: "Aprovada pela verificacao local.",
      aguardandoIa: true,
      atualizadoEm: new Date().toISOString(),
    },
  };
}

function solicitarRevisaoIA(id, dadosQuestao) {
  revisarTarefaComIA(id, dadosQuestao).catch(error => {
    console.log("Revisao por IA indisponivel:", error);
  });
}

function montarChaveParRima(palavraA, palavraB) {
  return [normalizarPalavra(palavraA), normalizarPalavra(palavraB)]
    .sort()
    .join("_");
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
