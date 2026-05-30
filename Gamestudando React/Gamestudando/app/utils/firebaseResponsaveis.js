import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export async function obterOuCriarCodigoAlunoResponsavel() {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Aluno nao logado.");
  }

  const alunoRef = doc(db, "usuarios", usuario.uid);
  const alunoSnap = await getDoc(alunoRef);
  const aluno = alunoSnap.exists() ? alunoSnap.data() : {};

  if (aluno.codigoResponsavel) {
    await salvarCodigoAluno(aluno.codigoResponsavel, usuario.uid, usuario, aluno);
    return aluno.codigoResponsavel;
  }

  const codigo = await gerarCodigoAlunoUnico();

  await setDoc(alunoRef, {
    codigoResponsavel: codigo,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });

  await salvarCodigoAluno(codigo, usuario.uid, usuario, aluno);

  return codigo;
}

export async function obterOuCriarCodigoResponsavel() {
  const responsavel = auth.currentUser;

  if (!responsavel) {
    throw new Error("Responsavel nao logado.");
  }

  const responsavelRef = doc(db, "usuarios", responsavel.uid);
  const responsavelSnap = await getDoc(responsavelRef);
  const dadosResponsavel = responsavelSnap.exists() ? responsavelSnap.data() : {};

  if (dadosResponsavel.codigoResponsavel) {
    await salvarCodigoResponsavel(
      dadosResponsavel.codigoResponsavel,
      responsavel.uid,
      responsavel,
      dadosResponsavel
    );
    return dadosResponsavel.codigoResponsavel;
  }

  const codigo = await gerarCodigoResponsavelUnico();

  await setDoc(responsavelRef, {
    codigoResponsavel: codigo,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });

  await salvarCodigoResponsavel(codigo, responsavel.uid, responsavel, dadosResponsavel);

  return codigo;
}

export async function vincularAlunoPorCodigoResponsavel(codigo) {
  const responsavel = auth.currentUser;

  if (!responsavel) {
    throw new Error("Responsavel nao logado.");
  }

  const codigoNormalizado = normalizarCodigoAluno(codigo);

  if (!codigoNormalizado) {
    throw new Error("CODIGO_ALUNO_VAZIO");
  }

  const codigoSnap = await getDoc(
    doc(db, "codigosAlunosResponsavel", codigoNormalizado)
  );

  if (!codigoSnap.exists() || codigoSnap.data()?.ativo === false) {
    throw new Error("ALUNO_NAO_ENCONTRADO");
  }

  const { alunoId } = codigoSnap.data();
  const alunoSnap = await getDoc(doc(db, "usuarios", alunoId));

  if (!alunoSnap.exists()) {
    throw new Error("ALUNO_NAO_ENCONTRADO");
  }

  const aluno = alunoSnap.data();

  if (aluno.tipo !== "aluno") {
    throw new Error("ALUNO_NAO_ENCONTRADO");
  }

  const responsavelSnap = await getDoc(doc(db, "usuarios", responsavel.uid));
  const dadosResponsavel = responsavelSnap.exists() ? responsavelSnap.data() : {};
  const resumoAluno = montarResumoAluno(alunoId, aluno);

  await setDoc(doc(db, "usuarios", responsavel.uid, "alunos", alunoId), {
    ...resumoAluno,
    vinculadoEm: serverTimestamp(),
    ativo: true,
  }, { merge: true });

  await setDoc(doc(db, "usuarios", alunoId, "responsaveis", responsavel.uid), {
    responsavelId: responsavel.uid,
    nome: dadosResponsavel.nome || responsavel.displayName || "Responsavel",
    email: dadosResponsavel.email || responsavel.email || null,
    vinculadoEm: serverTimestamp(),
    ativo: true,
  }, { merge: true });

  return resumoAluno;
}

export async function alunoVincularResponsavelPorCodigo(codigo) {
  const alunoUsuario = auth.currentUser;

  if (!alunoUsuario) {
    throw new Error("Aluno nao logado.");
  }

  const codigoNormalizado = normalizarCodigoAluno(codigo);

  if (!codigoNormalizado) {
    throw new Error("CODIGO_RESPONSAVEL_VAZIO");
  }

  const codigoSnap = await getDoc(
    doc(db, "codigosResponsaveis", codigoNormalizado)
  );

  if (!codigoSnap.exists() || codigoSnap.data()?.ativo === false) {
    throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
  }

  const { responsavelId } = codigoSnap.data();
  const responsavelSnap = await getDoc(doc(db, "usuarios", responsavelId));

  if (!responsavelSnap.exists()) {
    throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
  }

  const responsavel = responsavelSnap.data();

  if (responsavel.tipo !== "responsavel") {
    throw new Error("RESPONSAVEL_NAO_ENCONTRADO");
  }

  const alunoSnap = await getDoc(doc(db, "usuarios", alunoUsuario.uid));

  if (!alunoSnap.exists()) {
    throw new Error("ALUNO_NAO_ENCONTRADO");
  }

  const aluno = alunoSnap.data();
  const resumoAluno = montarResumoAluno(alunoUsuario.uid, aluno);

  await setDoc(doc(db, "usuarios", responsavelId, "alunos", alunoUsuario.uid), {
    ...resumoAluno,
    vinculadoEm: serverTimestamp(),
    ativo: true,
  }, { merge: true });

  await setDoc(doc(db, "usuarios", alunoUsuario.uid, "responsaveis", responsavelId), {
    responsavelId,
    nome: responsavel.nome || "Responsavel",
    email: responsavel.email || null,
    vinculadoEm: serverTimestamp(),
    ativo: true,
  }, { merge: true });

  return {
    id: responsavelId,
    responsavelId,
    nome: responsavel.nome || "Responsavel",
    email: responsavel.email || null,
  };
}

export async function listarResponsaveisDoAluno() {
  const aluno = auth.currentUser;

  if (!aluno) {
    throw new Error("Aluno nao logado.");
  }

  const snap = await getDocs(collection(db, "usuarios", aluno.uid, "responsaveis"));

  return snap.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .filter((responsavel) => responsavel.ativo !== false)
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));
}

export async function listarAlunosResponsavel() {
  const responsavel = auth.currentUser;

  if (!responsavel) {
    throw new Error("Responsavel nao logado.");
  }

  const vinculosSnap = await getDocs(
    collection(db, "usuarios", responsavel.uid, "alunos")
  );

  const alunos = await Promise.all(
    vinculosSnap.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((aluno) => aluno.ativo !== false)
      .map(async (vinculo) => {
        const alunoSnap = await getDoc(doc(db, "usuarios", vinculo.id));

        if (!alunoSnap.exists()) return vinculo;

        return {
          ...vinculo,
          ...montarResumoAluno(vinculo.id, alunoSnap.data()),
          vinculadoEm: vinculo.vinculadoEm,
          ativo: vinculo.ativo,
        };
      })
  );

  return alunos.sort((a, b) =>
    String(a.nome || "").localeCompare(String(b.nome || ""))
  );
}

export async function removerAlunoResponsavel(alunoId) {
  const responsavel = auth.currentUser;

  if (!responsavel) {
    throw new Error("Responsavel nao logado.");
  }

  await deleteDoc(doc(db, "usuarios", responsavel.uid, "alunos", alunoId));
  await deleteDoc(doc(db, "usuarios", alunoId, "responsaveis", responsavel.uid));
}

export function montarValorQrAlunoResponsavel(codigo) {
  return `gamestudando://responsavel/aluno/${codigo}`;
}

export function montarValorQrResponsavel(codigo) {
  return `gamestudando://aluno/responsavel/${codigo}`;
}

export function extrairCodigoAlunoResponsavel(valor) {
  const texto = String(valor || "").trim();
  const partes = texto.split(/[/:?#]+/).filter(Boolean);
  const ultimoSegmento = partes[partes.length - 1];

  if (ultimoSegmento) return normalizarCodigoAluno(ultimoSegmento);

  return normalizarCodigoAluno(texto);
}

export const extrairCodigoResponsavel = extrairCodigoAlunoResponsavel;

async function salvarCodigoAluno(codigo, alunoId, usuario, aluno) {
  await setDoc(doc(db, "codigosAlunosResponsavel", codigo), {
    codigo,
    alunoId,
    nome: aluno.nome || usuario.displayName || "Aluno",
    email: aluno.email || usuario.email || null,
    ativo: true,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
}

async function salvarCodigoResponsavel(codigo, responsavelId, usuario, responsavel) {
  await setDoc(doc(db, "codigosResponsaveis", codigo), {
    codigo,
    responsavelId,
    nome: responsavel.nome || usuario.displayName || "Responsavel",
    email: responsavel.email || usuario.email || null,
    ativo: true,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
}

async function gerarCodigoAlunoUnico() {
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = gerarCodigoAluno();
    const snap = await getDoc(doc(db, "codigosAlunosResponsavel", codigo));

    if (!snap.exists()) return codigo;
  }

  throw new Error("CODIGO_ALUNO_INDISPONIVEL");
}

async function gerarCodigoResponsavelUnico() {
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = gerarCodigoAluno();
    const snap = await getDoc(doc(db, "codigosResponsaveis", codigo));

    if (!snap.exists()) return codigo;
  }

  throw new Error("CODIGO_RESPONSAVEL_INDISPONIVEL");
}

function gerarCodigoAluno() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";

  for (let index = 0; index < 7; index += 1) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return codigo;
}

function normalizarCodigoAluno(codigo) {
  return String(codigo)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function montarResumoAluno(alunoId, aluno) {
  const matematica = aluno.materias?.matematica || aluno.matematica || {};
  const portugues = aluno.materias?.portugues || aluno.portugues || {};
  const rimas = aluno.materias?.rimas || aluno.rimas || {};
  const atividadesConcluidas =
    (matematica.atividadesConcluidas || 0) +
    (portugues.atividadesConcluidas || 0) +
    (rimas.atividadesConcluidas || 0);

  return {
    id: alunoId,
    alunoId,
    nome: aluno.nome || "Aluno",
    email: aluno.email || null,
    atividadesConcluidas,
    progresso: aluno.progresso || {},
    materias: {
      matematica,
      portugues,
      rimas,
    },
    estatisticas: aluno.estatisticas || {},
  };
}
