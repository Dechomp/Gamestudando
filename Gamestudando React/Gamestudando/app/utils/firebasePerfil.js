import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function salvarPerfilFirebase(uid, perfil) {
  if (!uid) {
    throw new Error("UID obrigatorio para salvar perfil no Firebase.");
  }

  await setDoc(
    doc(db, "usuarios", uid),
    {
      ...perfil,
      uid,
      atualizadoEm: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function carregarPerfilFirebase(uid) {
  if (!uid) {
    throw new Error("UID obrigatorio para carregar perfil do Firebase.");
  }

  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    uid: snap.id,
    ...snap.data(),
  };
}

export async function criarOuAtualizarAlunoFirebase(
  uid,
  perfil,
  opcoes = { merge: true }
) {
  const agora = serverTimestamp();
  const perfilFirebase = montarPerfilAlunoFirebase(uid, perfil);

  await setDoc(
    doc(db, "usuarios", uid),
    {
      ...perfilFirebase,
      criadoEm: perfil?.criadoEm || agora,
      atualizadoEm: agora,
    },
    { merge: opcoes.merge !== false }
  );
}

export function montarPerfilAlunoFirebase(uid, perfil) {
  const matematica = montarMateria(perfil?.matematica);
  const portugues = montarMateria(perfil?.portugues);
  const rimas = montarMateria(perfil?.rimas);

  return {
    uid,
    tipo: perfil?.tipo || "aluno",
    nome: perfil?.nome || "Aluno",
    email: perfil?.email || null,
    cpf: perfil?.cpf || null,
    telefone: perfil?.telefone || null,
    dataNascimento: perfil?.dataNascimento || null,
    status: perfil?.status || "ativo",
    isVerificado: perfil?.isVerificado ?? true,
    responsavelId: perfil?.responsavelId || null,
    configuracoes: {
      leituraPerguntasAtiva:
        perfil?.configuracoes?.leituraPerguntasAtiva !== false,
    },
    progresso: {
      faseLiberada: perfil?.progresso?.faseLiberada || 1,
      maiorFaseConcluida: perfil?.progresso?.maiorFaseConcluida || 0,
      avaliacaoInicialConcluida:
        perfil?.progresso?.avaliacaoInicialConcluida === true,
      avaliacaoInicialConcluidaEm:
        perfil?.progresso?.avaliacaoInicialConcluidaEm || null,
      materiasPorFase: perfil?.progresso?.materiasPorFase || {},
    },
    materias: {
      matematica,
      portugues,
      rimas,
    },
    estatisticas: {
      tempoTotalEstudoMs: perfil?.estatisticas?.tempoTotalEstudoMs || 0,
      tempoPorDiaMs: perfil?.estatisticas?.tempoPorDiaMs || {},
      sequenciaDias: perfil?.estatisticas?.sequenciaDias || 0,
      ultimaSessaoEm: perfil?.estatisticas?.ultimaSessaoEm || null,
      questoesRespondidasHoje:
        perfil?.estatisticas?.questoesRespondidasHoje || 0,
      acertosConsecutivos:
        perfil?.estatisticas?.acertosConsecutivos || 0,
      errosConsecutivos:
        perfil?.estatisticas?.errosConsecutivos || 0,
      materiaMaisFraca:
        perfil?.estatisticas?.materiaMaisFraca ||
        calcularMateriaMaisFraca({ matematica, portugues, rimas }),
      tipoQuestaoMaisDificil:
        perfil?.estatisticas?.tipoQuestaoMaisDificil || null,
      precisaRevisao: perfil?.estatisticas?.precisaRevisao || [],
    },
  };
}

function montarMateria(materia) {
  return {
    nivel: materia?.nivel || 3,
    acertos: materia?.acertos || 0,
    erros: materia?.erros || 0,
    ultimaPontuacao:
      typeof materia?.ultimaPontuacao === "number"
        ? materia.ultimaPontuacao
        : 0.5,
    atividadesConcluidas: materia?.atividadesConcluidas || 0,
    tempoMedioRespostaMs: materia?.tempoMedioRespostaMs || 0,
    tiposQuestao: materia?.tiposQuestao || {},
  };
}

function calcularMateriaMaisFraca(materias) {
  let menorMateria = null;
  let menorTaxa = Infinity;

  Object.entries(materias).forEach(([nome, dados]) => {
    const total = dados.acertos + dados.erros;
    const taxa = total > 0 ? dados.acertos / total : 0.5;

    if (taxa < menorTaxa) {
      menorTaxa = taxa;
      menorMateria = nome;
    }
  });

  return menorMateria;
}
