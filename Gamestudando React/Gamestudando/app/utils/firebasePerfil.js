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

export async function criarOuAtualizarAlunoFirebase(uid, perfil) {
  const agora = serverTimestamp();
  const perfilFirebase = montarPerfilAlunoFirebase(uid, perfil);

  await setDoc(
    doc(db, "usuarios", uid),
    {
      ...perfilFirebase,
      criadoEm: perfil?.criadoEm || agora,
      atualizadoEm: agora,
    },
    { merge: true }
  );
}

export function montarPerfilAlunoFirebase(uid, perfil) {
  return {
    uid,
    tipo: "aluno",
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
    },
    materias: {
      matematica: perfil?.matematica || {
        nivel: 3,
        acertos: 0,
        erros: 0,
        ultimaPontuacao: 0.5,
      },
      portugues: perfil?.portugues || {
        nivel: 3,
        acertos: 0,
        erros: 0,
        ultimaPontuacao: 0.5,
      },
      rimas: perfil?.rimas || {
        nivel: 3,
        acertos: 0,
        erros: 0,
        ultimaPontuacao: 0.5,
      },
    },
  };
}
