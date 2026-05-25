import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function criarTurmaProfessor({ nome }) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const nomeLimpo = nome.trim();

  if (nomeLimpo.length < 3) {
    throw new Error("NOME_TURMA_CURTO");
  }

  const codigo = await gerarCodigoUnico();

  const docRef = await addDoc(collection(db, "turmas"), {
    nome: nomeLimpo,
    codigo,
    professorId: usuario.uid,
    ativa: true,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  return {
    id: docRef.id,
    nome: nomeLimpo,
    codigo,
    professorId: usuario.uid,
    alunos: [],
  };
}

export async function listarTurmasProfessor() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const consulta = query(
    collection(db, "turmas"),
    where("professorId", "==", usuario.uid),
    where("ativa", "==", true)
  );

  const snap = await getDocs(consulta);
  const turmas = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const turma = {
        id: docSnap.id,
        ...docSnap.data(),
      };

      const alunos = await listarAlunosDaTurma(docSnap.id);

      return {
        ...turma,
        alunos,
      };
    })
  );

  return turmas.sort((a, b) => {
    const dataA = a.criadoEm?.seconds || 0;
    const dataB = b.criadoEm?.seconds || 0;
    return dataB - dataA;
  });
}

export async function obterTurmaProfessor(turmaId) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const ref = doc(db, "turmas", turmaId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("TURMA_NAO_ENCONTRADA");
  }

  const turma = {
    id: snap.id,
    ...snap.data(),
  };

  if (turma.professorId !== usuario.uid) {
    throw new Error("TURMA_SEM_PERMISSAO");
  }

  return {
    ...turma,
    alunos: await listarAlunosDaTurma(turmaId),
  };
}

export async function atualizarTurmaProfessor(turmaId, { nome }) {
  const turma = await obterTurmaProfessor(turmaId);
  const nomeLimpo = nome.trim();

  if (nomeLimpo.length < 3) {
    throw new Error("NOME_TURMA_CURTO");
  }

  await updateDoc(doc(db, "turmas", turma.id), {
    nome: nomeLimpo,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirTurmaProfessor(turmaId) {
  const turma = await obterTurmaProfessor(turmaId);

  await updateDoc(doc(db, "turmas", turma.id), {
    ativa: false,
    atualizadoEm: serverTimestamp(),
  });
}

export async function removerAlunoDaTurma(turmaId, alunoId) {
  await obterTurmaProfessor(turmaId);

  await deleteDoc(doc(db, "turmas", turmaId, "alunos", alunoId));
  await deleteDoc(doc(db, "usuarios", alunoId, "turmas", turmaId));
}

export async function listarAlunosDaTurma(turmaId) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "alunos"));

  return snap.docs
    .map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));
}

export async function entrarEmTurmaPorCodigo(codigo) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Aluno nao logado.");
  }

  const turma = await buscarTurmaPorCodigo(codigo);

  if (!turma) {
    throw new Error("TURMA_NAO_ENCONTRADA");
  }

  const alunoRef = doc(db, "usuarios", usuario.uid);
  const alunoSnap = await getDoc(alunoRef);
  const aluno = alunoSnap.exists() ? alunoSnap.data() : {};
  const professorSnap = await getDoc(doc(db, "usuarios", turma.professorId));
  const professor = professorSnap.exists() ? professorSnap.data() : {};
  const resumoAluno = montarResumoAluno(usuario.uid, usuario, aluno);

  await setDoc(doc(db, "turmas", turma.id, "alunos", usuario.uid), {
    ...resumoAluno,
    entrouEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  }, { merge: true });

  await setDoc(doc(db, "usuarios", usuario.uid, "turmas", turma.id), {
    turmaId: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    professorId: turma.professorId,
    professorNome: professor.nome || "Professor",
    entrouEm: serverTimestamp(),
    ativa: true,
  }, { merge: true });

  return {
    ...turma,
    professorNome: professor.nome || "Professor",
  };
}

export async function listarTurmasDoAluno() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Aluno nao logado.");
  }

  const snap = await getDocs(collection(db, "usuarios", usuario.uid, "turmas"));

  return snap.docs
    .map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .filter(turma => turma.ativa !== false)
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));
}

export function montarValorQrTurma(codigo) {
  return `gamestudando://turma/${codigo}`;
}

export function extrairCodigoTurma(valor) {
  const texto = String(valor || "").trim();
  const match = texto.match(/turma\/([A-Z0-9]+)/i);

  if (match?.[1]) return normalizarCodigoTurma(match[1]);

  return normalizarCodigoTurma(texto);
}

async function buscarTurmaPorCodigo(codigo) {
  const consulta = query(
    collection(db, "turmas"),
    where("codigo", "==", normalizarCodigoTurma(codigo)),
    where("ativa", "==", true)
  );

  const snap = await getDocs(consulta);

  if (snap.empty) return null;

  const docSnap = snap.docs[0];

  return {
    id: docSnap.id,
    ...docSnap.data(),
  };
}

async function gerarCodigoUnico() {
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = gerarCodigoTurma();
    const consulta = query(
      collection(db, "turmas"),
      where("codigo", "==", codigo)
    );
    const snap = await getDocs(consulta);

    if (snap.empty) return codigo;
  }

  throw new Error("CODIGO_TURMA_INDISPONIVEL");
}

function gerarCodigoTurma() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";

  for (let index = 0; index < 6; index += 1) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return codigo;
}

function normalizarCodigoTurma(codigo) {
  return String(codigo)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function montarResumoAluno(uid, usuario, aluno) {
  const matematica = aluno.matematica || aluno.materias?.matematica || {};
  const portugues = aluno.portugues || aluno.materias?.portugues || {};
  const rimas = aluno.rimas || aluno.materias?.rimas || {};
  const atividadesConcluidas =
    (matematica.atividadesConcluidas || 0) +
    (portugues.atividadesConcluidas || 0) +
    (rimas.atividadesConcluidas || 0);

  return {
    alunoId: uid,
    nome: aluno.nome || usuario.displayName || "Aluno",
    email: aluno.email || usuario.email || null,
    atividadesConcluidas,
    materias: {
      matematica,
      portugues,
      rimas,
    },
    estatisticas: aluno.estatisticas || {},
  };
}
