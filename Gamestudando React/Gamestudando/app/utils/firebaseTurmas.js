import {
  addDoc,
  arrayUnion,
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

const TIPOS_TURMA = ["regular", "maker", "mista"];

export async function criarTurmaProfessor({ nome, tipo = "regular" }) {
  // Cria uma turma para o professor logado e gera o codigo de entrada.
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Professor nao logado.");
  }

  const nomeLimpo = nome.trim();

  if (nomeLimpo.length < 3) {
    throw new Error("NOME_TURMA_CURTO");
  }

  if (!TIPOS_TURMA.includes(tipo)) {
    throw new Error("TIPO_TURMA_INVALIDO");
  }

  const codigo = await gerarCodigoUnico();

  const docRef = await addDoc(collection(db, "turmas"), {
    nome: nomeLimpo,
    codigo,
    professorId: usuario.uid,
    tipo,
    ativa: true,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  return {
    id: docRef.id,
    nome: nomeLimpo,
    codigo,
    professorId: usuario.uid,
    tipo,
    alunos: [],
  };
}

export async function listarTurmasProfessor() {
  // Busca as turmas ativas do professor e ja traz os alunos de cada uma.
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
  // Carrega uma turma e confirma se ela pertence ao professor atual.
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
  // Altera somente o nome da turma, mantendo codigo e alunos.
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
  // Marca a turma como inativa para manter o historico no banco.
  const turma = await obterTurmaProfessor(turmaId);

  await updateDoc(doc(db, "turmas", turma.id), {
    ativa: false,
    atualizadoEm: serverTimestamp(),
  });
}

export async function removerAlunoDaTurma(turmaId, alunoId) {
  // Remove o vinculo nos dois lados: turma e perfil do aluno.
  await obterTurmaProfessor(turmaId);

  await deleteDoc(doc(db, "turmas", turmaId, "alunos", alunoId));
  await deleteDoc(doc(db, "usuarios", alunoId, "turmas", turmaId));
}

export async function adicionarAlunoNaTurmaPorCodigo(turmaId, codigoAluno, { nivelAtual, moedasAtuais } = {}) {
  // Permite ao professor adicionar o aluno lendo ou digitando o codigo dele.
  const turma = await obterTurmaProfessor(turmaId);
  const codigo = extrairCodigoAluno(codigoAluno);

  if (!codigo) {
    throw new Error("CODIGO_ALUNO_VAZIO");
  }

  // Alunos regulares usam seu código de vínculo; alunos Maker mostram o QR Maker.
  let codigoSnap = await getDoc(doc(db, "codigosAlunosResponsavel", codigo));
  if (!codigoSnap.exists() || codigoSnap.data()?.ativo === false) {
    codigoSnap = await getDoc(doc(db, "codigosMaker", codigo));
  }

  if (!codigoSnap.exists() || codigoSnap.data()?.ativo === false) {
    throw new Error("ALUNO_NAO_ENCONTRADO");
  }

  const dadosDoCodigo = codigoSnap.data();
  const { alunoId } = dadosDoCodigo;
  // O professor não pode ler o perfil privado de um aluno antes de vinculá-lo.
  // O índice do QR carrega apenas o mínimo necessário para criar o vínculo.
  const aluno = {
    tipo: dadosDoCodigo.tipo || "aluno",
    nome: dadosDoCodigo.nome || "Aluno",
    email: dadosDoCodigo.email || null,
    materias: dadosDoCodigo.materias || {},
    estatisticas: dadosDoCodigo.estatisticas || {},
  };
  const tipoDaTurma = turma.tipo || "mista";
  if (tipoDaTurma === "maker" && aluno.tipo !== "aluno_maker") throw new Error("TURMA_APENAS_MAKER");
  if (tipoDaTurma === "regular" && aluno.tipo === "aluno_maker") throw new Error("TURMA_APENAS_REGULAR");
  let saldoInicialMaker = null;
  if (aluno.tipo === "aluno_maker") {
    // O professor ainda não tem acesso à lista privada de turmas de um aluno novo.
    // A vinculação usa apenas o QR público e evita essa leitura que o Firestore bloqueia.
    if (nivelAtual !== undefined || moedasAtuais !== undefined) {
      const nivel = Number(nivelAtual);
      const moedas = Number(moedasAtuais);
      if (!Number.isFinite(nivel) || nivel < 1 || !Number.isFinite(moedas) || moedas < 0) throw new Error("SALDO_MAKER_INVALIDO");
      saldoInicialMaker = { nivel, moedas };
    }
  }
  const professorSnap = await getDoc(doc(db, "usuarios", turma.professorId));
  const professor = professorSnap.exists() ? professorSnap.data() : {};
  const resumoAluno = montarResumoAluno(alunoId, { displayName: aluno.nome }, aluno);

  await setDoc(doc(db, "turmas", turma.id, "alunos", alunoId), {
    ...resumoAluno,
    entrouEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  }, { merge: true });

  await setDoc(doc(db, "usuarios", alunoId, "turmas", turma.id), {
    turmaId: turma.id,
    nome: turma.nome,
    codigo: turma.codigo,
    professorId: turma.professorId,
    professorNome: professor.nome || "Professor",
    tipo: turma.tipo || "mista",
    entrouEm: serverTimestamp(),
    ativa: true,
  }, { merge: true });

  // O mesmo perfil Maker pode participar de várias turmas. Registramos cada
  // turma e professor autorizado sem duplicar níveis ou Maker Coins.
  if (aluno.tipo === "aluno_maker") {
    try {
      await setDoc(doc(db, "makerPerfis", alunoId), {
        alunoId,
        ...(saldoInicialMaker || {}),
        ultimaTurmaId: turma.id,
        turmaIds: arrayUnion(turma.id),
        professorIds: arrayUnion(turma.professorId),
        atualizadoEm: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      // O vínculo já foi criado nas duas pontas. Não bloquear a entrada do
      // aluno enquanto uma regra recém-publicada ainda está propagando.
      console.log("Vínculo criado; perfil Maker aguardando sincronização:", error);
    }
  }

  return resumoAluno;
}

export async function listarAlunosDaTurma(turmaId) {
  // Retorna os alunos em ordem alfabetica para facilitar o relatorio.
  const snap = await getDocs(collection(db, "turmas", turmaId, "alunos"));

  return snap.docs
    .map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
    .sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || "")));
}

export async function entrarEmTurmaPorCodigo(codigo) {
  // Faz o aluno entrar em uma turma usando o codigo ou QR Code da turma.
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
    tipo: turma.tipo || "mista",
    entrouEm: serverTimestamp(),
    ativa: true,
  }, { merge: true });

  if (aluno.tipo === "aluno_maker") {
    try {
      await setDoc(doc(db, "makerPerfis", usuario.uid), {
        alunoId: usuario.uid,
        ultimaTurmaId: turma.id,
        turmaIds: arrayUnion(turma.id),
        professorIds: arrayUnion(turma.professorId),
        atualizadoEm: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.log("Turma vinculada; perfil Maker aguardando sincronização:", error);
    }
  }

  return {
    ...turma,
    professorNome: professor.nome || "Professor",
  };
}

export async function listarTurmasDoAluno() {
  // Mostra no perfil do aluno as turmas em que ele participa.
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
  // Valor gravado no QR Code da turma.
  return `gamestudando://turma/${codigo}`;
}

export function extrairCodigoTurma(valor) {
  // Aceita tanto o link do QR Code quanto o codigo digitado manualmente.
  const texto = String(valor || "").trim();
  const match = texto.match(/turma\/([A-Z0-9]+)/i);

  if (match?.[1]) return normalizarCodigoTurma(match[1]);

  return normalizarCodigoTurma(texto);
}

async function buscarTurmaPorCodigo(codigo) {
  // Procura uma turma ativa pelo codigo publico.
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
  // Tenta gerar um codigo que ainda nao exista no Firestore.
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = gerarCodigoTurma();
    const consulta = query(
      collection(db, "turmas"),
      where("codigo", "==", codigo),
      // A regra de leitura permite consultas públicas somente para turmas ativas.
      where("ativa", "==", true)
    );
    const snap = await getDocs(consulta);

    if (snap.empty) return codigo;
  }

  throw new Error("CODIGO_TURMA_INDISPONIVEL");
}

function gerarCodigoTurma() {
  // Usa letras e numeros faceis de ler, evitando caracteres confusos.
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let codigo = "";

  for (let index = 0; index < 6; index += 1) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }

  return codigo;
}

function normalizarCodigoTurma(codigo) {
  // Padroniza o codigo para aceitar letras minusculas ou espacos digitados.
  return String(codigo)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export async function sincronizarResumoAlunoNasTurmas(alunoId, perfil) {
  // O professor lê o resumo salvo na turma, não o perfil privado do aluno.
  // Por isso o próprio aluno atualiza apenas seus dados de progresso nas turmas
  // em que já está vinculado.
  const usuario = auth.currentUser;
  if (!usuario || usuario.uid !== alunoId) return;

  const vinculosSnap = await getDocs(collection(db, "usuarios", alunoId, "turmas"));
  const resumo = montarResumoAluno(alunoId, { displayName: perfil?.nome, email: perfil?.email }, perfil || {});

  await Promise.all(vinculosSnap.docs
    .map((vinculo) => ({ id: vinculo.id, ...vinculo.data() }))
    .filter((vinculo) => vinculo.ativa !== false)
    .map((vinculo) => setDoc(doc(db, "turmas", vinculo.id, "alunos", alunoId), {
      nome: resumo.nome,
      email: resumo.email,
      tipo: resumo.tipo,
      atividadesConcluidas: resumo.atividadesConcluidas,
      materias: resumo.materias,
      estatisticas: resumo.estatisticas,
      atualizadoEm: serverTimestamp(),
    }, { merge: true })));
}

function extrairCodigoAluno(valor) {
  // Aceita códigos digitados e os QR Codes dos alunos regulares e Maker.
  const texto = String(valor || "").trim();
  const matchMaker = texto.match(/maker\/aluno\/([A-Z0-9]+)/i);
  const matchAluno = texto.match(/(?:responsavel\/)?aluno\/([A-Z0-9]+)/i);
  return normalizarCodigoTurma(matchMaker?.[1] || matchAluno?.[1] || texto);
}

function montarResumoAluno(uid, usuario, aluno) {
  // Guarda na turma somente os dados necessarios para relatorio.
  const matematica = aluno.matematica || aluno.materias?.matematica || {};
  const portugues = aluno.portugues || aluno.materias?.portugues || {};
  const rimas = aluno.rimas || aluno.materias?.rimas || {};
  const maker = aluno.maker || aluno.materias?.maker || {};
  const atividadesConcluidas =
    (matematica.atividadesConcluidas || 0) +
    (portugues.atividadesConcluidas || 0) +
    (rimas.atividadesConcluidas || 0) +
    (maker.atividadesConcluidas || 0);

  return {
    alunoId: uid,
    tipo: aluno.tipo || "aluno",
    nome: aluno.nome || usuario.displayName || "Aluno",
    email: aluno.email || usuario.email || null,
    atividadesConcluidas,
    materias: {
      matematica,
      portugues,
      rimas,
      maker,
    },
    estatisticas: aluno.estatisticas || {},
  };
}
