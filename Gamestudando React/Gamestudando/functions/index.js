const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { randomBytes } = require("crypto");

admin.initializeApp();

const db = admin.firestore();

exports.operacaoDadosApp = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Faca login para acessar os dados.");
  }

  const acao = String(data?.acao || "");
  const dados = data?.dados || {};

  if (acao === "perfil.carregar") {
    const uid = String(dados.uid || context.auth.uid);
    if (uid !== context.auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "SEM_PERMISSAO");
    }
    const snap = await db.collection("usuarios").doc(uid).get();
    return { perfil: snap.exists ? { uid: snap.id, ...snap.data() } : null };
  }

  if (acao === "perfil.salvar") {
    const uid = String(dados.uid || "");
    if (uid !== context.auth.uid) {
      throw new functions.https.HttpsError("permission-denied", "SEM_PERMISSAO");
    }

    const perfil = dados.perfil || {};
    const referencia = db.collection("usuarios").doc(uid);
    const atual = await referencia.get();
    const tipoAtual = atual.data()?.tipo;
    const tiposValidos = ["aluno", "aluno_maker", "professor", "responsavel"];
    const tipoSolicitado = perfil.tipo || tipoAtual;

    if (!tiposValidos.includes(tipoSolicitado) || (tipoAtual && tipoSolicitado !== tipoAtual)) {
      throw new functions.https.HttpsError("permission-denied", "TIPO_DE_CONTA_INVALIDO");
    }

    const perfilSeguro = {
      ...perfil,
      uid,
      tipo: tipoSolicitado,
      atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
    };
    delete perfilSeguro.codigoMaker;
    delete perfilSeguro.maker;

    if (!atual.exists) perfilSeguro.criadoEm = admin.firestore.FieldValue.serverTimestamp();
    await referencia.set(perfilSeguro, { merge: dados.merge !== false });
    return { ok: true };
  }

  if (acao.startsWith("turmas.")) {
    return executarOperacaoTurmas(acao, dados, context.auth.uid);
  }

  if (acao.startsWith("responsaveis.")) {
    return executarOperacaoResponsaveis(acao, dados, context.auth.uid);
  }

  if (acao === "conteudos.buscar") {
    const materia = String(dados.materia || "");
    const formato = String(dados.formato || "");
    const snap = await db.collection("questoes").where("materia", "==", materia).where("formato", "==", formato).where("ativa", "==", true).where("statusRevisao", "==", "aprovada").get();
    return { questoes: snap.docs.map((item) => ({ id: item.id, ...item.data() })) };
  }

  if (acao === "conteudos.semear") {
    const professor = await db.collection("usuarios").doc(context.auth.uid).get();
    if (professor.data()?.tipo !== "professor") negar("SEM_PERMISSAO");
    const questoes = Array.isArray(dados.questoes) ? dados.questoes : [];
    for (let inicio = 0; inicio < questoes.length; inicio += 400) {
      const batch = db.batch();
      questoes.slice(inicio, inicio + 400).forEach((questao) => {
        const { id, ...conteudo } = questao;
        batch.set(db.collection("questoes").doc(id), { ...conteudo, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });
      await batch.commit();
    }
    return { total: questoes.length };
  }

  if (acao.startsWith("tarefas.")) {
    const professor = await db.collection("usuarios").doc(context.auth.uid).get();
    if (professor.data()?.tipo !== "professor") negar("SEM_PERMISSAO");
    if (acao === "tarefas.listar") {
      const snap = await db.collection("questoes").where("criadaPor", "==", context.auth.uid).get();
      return { questoes: snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)) };
    }
    if (acao === "tarefas.criar") {
      const questao = dados.questao || {};
      const referencia = await db.collection("questoes").add({ ...questao, ativa: true, statusRevisao: "aprovada", revisao: { status: "aprovada", origem: "local", aguardandoIa: true }, criadaPor: context.auth.uid, origem: "professor", criadoEm: admin.firestore.FieldValue.serverTimestamp(), atualizadoEm: admin.firestore.FieldValue.serverTimestamp() });
      return { id: referencia.id };
    }
    const id = String(dados.id || "");
    const referencia = db.collection("questoes").doc(id);
    const atual = await referencia.get();
    if (!atual.exists || atual.data()?.criadaPor !== context.auth.uid) negar("SEM_PERMISSAO");
    if (acao === "tarefas.atualizar") { await referencia.update({ ...(dados.questao || {}), ativa: true, statusRevisao: "aprovada", atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }); return { ok: true }; }
    if (acao === "tarefas.excluir") { await referencia.delete(); return { ok: true }; }
  }

  throw new functions.https.HttpsError("invalid-argument", "OPERACAO_NAO_ENCONTRADA");
});

async function executarOperacaoResponsaveis(acao, dados, uid) {
  const usuarioRef = db.collection("usuarios").doc(uid);
  const usuarioSnap = await usuarioRef.get();
  const usuario = usuarioSnap.data() || {};

  if (acao === "responsaveis.codigoAluno") {
    if (!["aluno", "aluno_maker"].includes(usuario.tipo)) negar("SEM_PERMISSAO");
    const codigo = usuario.codigoResponsavel || await gerarCodigoVinculoUnico("codigosAlunosResponsavel");
    const batch = db.batch();
    batch.set(usuarioRef, { codigoResponsavel: codigo, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    batch.set(db.collection("codigosAlunosResponsavel").doc(codigo), { codigo, alunoId: uid, ativo: true, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit(); return { codigo };
  }

  if (acao === "responsaveis.codigoResponsavel") {
    if (usuario.tipo !== "responsavel") negar("SEM_PERMISSAO");
    const codigo = usuario.codigoResponsavel || await gerarCodigoVinculoUnico("codigosResponsaveis");
    const batch = db.batch();
    batch.set(usuarioRef, { codigoResponsavel: codigo, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    batch.set(db.collection("codigosResponsaveis").doc(codigo), { codigo, responsavelId: uid, ativo: true, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    await batch.commit(); return { codigo };
  }

  if (acao === "responsaveis.vincularAluno") {
    if (usuario.tipo !== "responsavel") negar("SEM_PERMISSAO");
    const codigo = normalizarCodigoTurmaApi(dados.codigo);
    const indice = await db.collection("codigosAlunosResponsavel").doc(codigo).get();
    if (!indice.exists || indice.data()?.ativo === false) erro("ALUNO_NAO_ENCONTRADO");
    const alunoSnap = await db.collection("usuarios").doc(indice.data().alunoId).get();
    if (!alunoSnap.exists || !["aluno", "aluno_maker"].includes(alunoSnap.data()?.tipo)) erro("ALUNO_NAO_ENCONTRADO");
    await criarVinculoResponsavelApi({ responsavelId: uid, responsavel: usuario, alunoId: alunoSnap.id, aluno: alunoSnap.data() });
    return montarResumoAlunoApi(alunoSnap.id, alunoSnap.data());
  }

  if (acao === "responsaveis.vincularResponsavel") {
    if (!["aluno", "aluno_maker"].includes(usuario.tipo)) negar("SEM_PERMISSAO");
    const codigo = normalizarCodigoTurmaApi(dados.codigo);
    const indice = await db.collection("codigosResponsaveis").doc(codigo).get();
    if (!indice.exists || indice.data()?.ativo === false) erro("RESPONSAVEL_NAO_ENCONTRADO");
    const responsavelSnap = await db.collection("usuarios").doc(indice.data().responsavelId).get();
    if (!responsavelSnap.exists || responsavelSnap.data()?.tipo !== "responsavel") erro("RESPONSAVEL_NAO_ENCONTRADO");
    await criarVinculoResponsavelApi({ responsavelId: responsavelSnap.id, responsavel: responsavelSnap.data(), alunoId: uid, aluno: usuario });
    return { id: responsavelSnap.id, responsavelId: responsavelSnap.id, nome: responsavelSnap.data().nome || "Responsavel", email: responsavelSnap.data().email || null };
  }

  if (acao === "responsaveis.listarDoAluno") {
    if (!["aluno", "aluno_maker"].includes(usuario.tipo)) negar("SEM_PERMISSAO");
    const snap = await usuarioRef.collection("responsaveis").get();
    return { responsaveis: snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.ativo !== false).sort((a, b) => String(a.nome).localeCompare(String(b.nome))) };
  }

  if (acao === "responsaveis.listarAlunos") {
    if (usuario.tipo !== "responsavel") negar("SEM_PERMISSAO");
    const snap = await usuarioRef.collection("alunos").get();
    const alunos = await Promise.all(snap.docs.filter((item) => item.data().ativo !== false).map(async (item) => {
      const alunoSnap = await db.collection("usuarios").doc(item.id).get();
      return alunoSnap.exists ? { ...montarResumoAlunoApi(item.id, alunoSnap.data()), vinculadoEm: item.data().vinculadoEm, ativo: item.data().ativo } : { id: item.id, ...item.data() };
    }));
    return { alunos: alunos.sort((a, b) => String(a.nome).localeCompare(String(b.nome))) };
  }

  if (acao === "responsaveis.removerAluno") {
    if (usuario.tipo !== "responsavel") negar("SEM_PERMISSAO");
    const alunoId = String(dados.alunoId || "");
    const batch = db.batch();
    batch.delete(usuarioRef.collection("alunos").doc(alunoId));
    batch.delete(db.collection("usuarios").doc(alunoId).collection("responsaveis").doc(uid));
    await batch.commit(); return { ok: true };
  }

  erro("OPERACAO_NAO_ENCONTRADA");
}

async function criarVinculoResponsavelApi({ responsavelId, responsavel, alunoId, aluno }) {
  const batch = db.batch();
  batch.set(db.collection("usuarios").doc(responsavelId).collection("alunos").doc(alunoId), { ...montarResumoAlunoApi(alunoId, aluno), vinculadoEm: admin.firestore.FieldValue.serverTimestamp(), ativo: true }, { merge: true });
  batch.set(db.collection("usuarios").doc(alunoId).collection("responsaveis").doc(responsavelId), { responsavelId, nome: responsavel.nome || "Responsavel", email: responsavel.email || null, vinculadoEm: admin.firestore.FieldValue.serverTimestamp(), ativo: true }, { merge: true });
  await batch.commit();
}

async function gerarCodigoVinculoUnico(colecao) {
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = randomBytes(5).toString("hex").toUpperCase().slice(0, 7);
    const snap = await db.collection(colecao).doc(codigo).get();
    if (!snap.exists) return codigo;
  }
  erro("CODIGO_INDISPONIVEL");
}

async function executarOperacaoTurmas(acao, dados, uid) {
  const usuarioSnap = await db.collection("usuarios").doc(uid).get();
  const usuario = usuarioSnap.data() || {};
  const turmaId = String(dados.turmaId || "").trim();

  if (acao === "turmas.criar") {
    if (usuario.tipo !== "professor") negar("SEM_PERMISSAO");
    const nome = String(dados.nome || "").trim();
    if (nome.length < 3) erro("NOME_TURMA_CURTO");
    const codigo = await gerarCodigoTurmaUnico();
    const referencia = await db.collection("turmas").add({ nome, codigo, professorId: uid, ativa: true, criadoEm: admin.firestore.FieldValue.serverTimestamp(), atualizadoEm: admin.firestore.FieldValue.serverTimestamp() });
    return { id: referencia.id, nome, codigo, professorId: uid, alunos: [] };
  }

  if (acao === "turmas.listarProfessor") {
    if (usuario.tipo !== "professor") negar("SEM_PERMISSAO");
    const snap = await db.collection("turmas").where("professorId", "==", uid).where("ativa", "==", true).get();
    const turmas = await Promise.all(snap.docs.map(async (item) => ({ id: item.id, ...item.data(), alunos: await listarAlunosTurmaApi(item.id) })));
    return { turmas: turmas.sort((a, b) => (b.criadoEm?.seconds || 0) - (a.criadoEm?.seconds || 0)) };
  }

  if (acao === "turmas.listarDoAluno") {
    const snap = await db.collection("usuarios").doc(uid).collection("turmas").get();
    return { turmas: snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((turma) => turma.ativa !== false).sort((a, b) => String(a.nome).localeCompare(String(b.nome))) };
  }

  if (acao === "turmas.entrarPorCodigo") {
    if (!["aluno", "aluno_maker"].includes(usuario.tipo)) negar("SEM_PERMISSAO");
    const codigo = normalizarCodigoTurmaApi(dados.codigo);
    const snap = await db.collection("turmas").where("codigo", "==", codigo).where("ativa", "==", true).limit(1).get();
    if (snap.empty) erro("TURMA_NAO_ENCONTRADA");
    const turma = { id: snap.docs[0].id, ...snap.docs[0].data() };
    await vincularAlunoTurmaApi(turma, uid, usuario);
    const professor = await db.collection("usuarios").doc(turma.professorId).get();
    return { ...turma, professorNome: professor.data()?.nome || "Professor" };
  }

  const turma = await obterTurmaDoProfessorApi(turmaId, uid);
  if (acao === "turmas.obterProfessor") return { ...turma, alunos: await listarAlunosTurmaApi(turmaId) };
  if (acao === "turmas.listarAlunos") return { alunos: await listarAlunosTurmaApi(turmaId) };
  if (acao === "turmas.atualizar") {
    const nome = String(dados.nome || "").trim(); if (nome.length < 3) erro("NOME_TURMA_CURTO");
    await db.collection("turmas").doc(turmaId).update({ nome, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }); return { ok: true };
  }
  if (acao === "turmas.excluir") { await db.collection("turmas").doc(turmaId).update({ ativa: false, atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }); return { ok: true }; }
  if (acao === "turmas.removerAluno") {
    const alunoId = String(dados.alunoId || "");
    await Promise.all([db.collection("turmas").doc(turmaId).collection("alunos").doc(alunoId).delete(), db.collection("usuarios").doc(alunoId).collection("turmas").doc(turmaId).delete()]); return { ok: true };
  }
  if (acao === "turmas.adicionarAlunoPorCodigo") {
    const codigo = normalizarCodigoTurmaApi(dados.codigoAluno); if (!codigo) erro("CODIGO_ALUNO_VAZIO");
    const indice = await db.collection("codigosAlunosResponsavel").doc(codigo).get(); if (!indice.exists || indice.data()?.ativo === false) erro("ALUNO_NAO_ENCONTRADO");
    const alunoSnap = await db.collection("usuarios").doc(indice.data().alunoId).get(); if (!alunoSnap.exists) erro("ALUNO_NAO_ENCONTRADO");
    return vincularAlunoTurmaApi(turma, alunoSnap.id, alunoSnap.data());
  }
  erro("OPERACAO_NAO_ENCONTRADA");
}

async function obterTurmaDoProfessorApi(turmaId, uid) {
  const snap = await db.collection("turmas").doc(turmaId).get();
  if (!snap.exists || snap.data()?.professorId !== uid) negar("TURMA_SEM_PERMISSAO");
  return { id: snap.id, ...snap.data() };
}
async function listarAlunosTurmaApi(turmaId) {
  const snap = await db.collection("turmas").doc(turmaId).collection("alunos").get();
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
}
async function vincularAlunoTurmaApi(turma, alunoId, aluno) {
  const resumo = montarResumoAlunoApi(alunoId, aluno);
  const professor = await db.collection("usuarios").doc(turma.professorId).get();
  const batch = db.batch();
  batch.set(db.collection("turmas").doc(turma.id).collection("alunos").doc(alunoId), { ...resumo, entrouEm: admin.firestore.FieldValue.serverTimestamp(), atualizadoEm: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  batch.set(db.collection("usuarios").doc(alunoId).collection("turmas").doc(turma.id), { turmaId: turma.id, nome: turma.nome, codigo: turma.codigo, professorId: turma.professorId, professorNome: professor.data()?.nome || "Professor", entrouEm: admin.firestore.FieldValue.serverTimestamp(), ativa: true }, { merge: true });
  await batch.commit(); return resumo;
}
function montarResumoAlunoApi(alunoId, aluno) { const materias = aluno.materias || {}; const matematica = aluno.matematica || materias.matematica || {}; const portugues = aluno.portugues || materias.portugues || {}; const rimas = aluno.rimas || materias.rimas || {}; return { alunoId, nome: aluno.nome || "Aluno", email: aluno.email || null, atividadesConcluidas: (matematica.atividadesConcluidas || 0) + (portugues.atividadesConcluidas || 0) + (rimas.atividadesConcluidas || 0), materias: { matematica, portugues, rimas }, estatisticas: aluno.estatisticas || {} }; }
async function gerarCodigoTurmaUnico() { for (let tentativa = 0; tentativa < 8; tentativa += 1) { const codigo = randomBytes(4).toString("hex").toUpperCase().slice(0, 6); const snap = await db.collection("turmas").where("codigo", "==", codigo).limit(1).get(); if (snap.empty) return codigo; } erro("CODIGO_TURMA_INDISPONIVEL"); }
function normalizarCodigoTurmaApi(valor) { return String(valor || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, ""); }
function negar(mensagem) { throw new functions.https.HttpsError("permission-denied", mensagem); }
function erro(mensagem) { throw new functions.https.HttpsError("invalid-argument", mensagem); }

exports.obterQrMaker = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Faca login para acessar o QR Maker.");
  }

  const alunoRef = db.collection("usuarios").doc(context.auth.uid);
  const perfilMakerRef = db.collection("makerPerfis").doc(context.auth.uid);
  const alunoSnap = await alunoRef.get();
  const aluno = alunoSnap.data();

  if (!alunoSnap.exists || aluno?.tipo !== "aluno_maker") {
    throw new functions.https.HttpsError("permission-denied", "ALUNO_MAKER_OBRIGATORIO");
  }

  const perfilMakerSnap = await perfilMakerRef.get();
  let codigo = perfilMakerSnap.data()?.codigo;

  if (!codigo) {
    codigo = await gerarCodigoMakerUnico();
    await db.runTransaction(async (transacao) => {
      const atual = await transacao.get(perfilMakerRef);
      const codigoAtual = atual.data()?.codigo;

      if (codigoAtual) {
        codigo = codigoAtual;
        return;
      }

      transacao.set(perfilMakerRef, {
        codigo,
        alunoId: context.auth.uid,
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      transacao.set(db.collection("codigosMaker").doc(codigo), {
        alunoId: context.auth.uid,
        ativo: true,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });
    });
  }

  return { codigo };
});

exports.listarTurmasMakerProfessor = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Faca login para acessar as turmas.");
  }

  const professorSnap = await db.collection("usuarios").doc(context.auth.uid).get();
  if (professorSnap.data()?.tipo !== "professor") {
    throw new functions.https.HttpsError("permission-denied", "SEM_PERMISSAO");
  }

  const turmasSnap = await db.collection("turmas")
    .where("professorId", "==", context.auth.uid)
    .where("ativa", "==", true)
    .get();

  const turmas = await Promise.all(turmasSnap.docs.map(async (turmaSnap) => {
    const alunosSnap = await turmaSnap.ref.collection("alunos").get();
    return {
      id: turmaSnap.id,
      nome: turmaSnap.data().nome || "Turma",
      totalAlunos: alunosSnap.size,
    };
  }));

  return { turmas: turmas.sort((a, b) => a.nome.localeCompare(b.nome)) };
});

exports.registrarPresencaMaker = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Faca login para registrar a chamada.");
  }

  const turmaId = String(data?.turmaId || "").trim();
  const codigo = normalizarCodigoMaker(data?.valorQr);

  if (!turmaId || !codigo) {
    throw new functions.https.HttpsError("invalid-argument", "TURMA_E_QR_OBRIGATORIOS");
  }

  const [professorSnap, turmaSnap, codigoSnap] = await Promise.all([
    db.collection("usuarios").doc(context.auth.uid).get(),
    db.collection("turmas").doc(turmaId).get(),
    db.collection("codigosMaker").doc(codigo).get(),
  ]);

  if (professorSnap.data()?.tipo !== "professor") {
    throw new functions.https.HttpsError("permission-denied", "SEM_PERMISSAO");
  }
  if (!turmaSnap.exists || turmaSnap.data()?.professorId !== context.auth.uid) {
    throw new functions.https.HttpsError("permission-denied", "TURMA_NAO_ENCONTRADA");
  }
  if (!codigoSnap.exists || codigoSnap.data()?.ativo === false) {
    throw new functions.https.HttpsError("not-found", "ALUNO_NAO_ENCONTRADO");
  }

  const alunoId = codigoSnap.data().alunoId;
  const [alunoSnap, vinculoSnap] = await Promise.all([
    db.collection("usuarios").doc(alunoId).get(),
    db.collection("turmas").doc(turmaId).collection("alunos").doc(alunoId).get(),
  ]);

  if (!alunoSnap.exists || alunoSnap.data()?.tipo !== "aluno_maker") {
    throw new functions.https.HttpsError("not-found", "ALUNO_NAO_ENCONTRADO");
  }
  if (!vinculoSnap.exists) {
    throw new functions.https.HttpsError("permission-denied", "ALUNO_FORA_DA_TURMA");
  }

  const dataChamada = dataAtualSaoPaulo();
  const presencaRef = db.collection("turmas").doc(turmaId)
    .collection("chamadasMaker").doc(dataChamada)
    .collection("presencas").doc(alunoId);

  const jaRegistrado = await db.runTransaction(async (transacao) => {
    const presenca = await transacao.get(presencaRef);
    if (presenca.exists) return true;

    transacao.set(presencaRef, {
      alunoId,
      alunoNome: alunoSnap.data().nome || "Aluno Maker",
      presente: true,
      registradoPor: context.auth.uid,
      registradoEm: admin.firestore.FieldValue.serverTimestamp(),
    });
    transacao.set(
      db.collection("turmas").doc(turmaId).collection("chamadasMaker").doc(dataChamada),
      {
        data: dataChamada,
        turmaId,
        professorId: context.auth.uid,
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return false;
  });

  return {
    alunoNome: alunoSnap.data().nome || "Aluno Maker",
    jaRegistrado,
    data: dataChamada,
  };
});

async function gerarCodigoMakerUnico() {
  for (let tentativa = 0; tentativa < 8; tentativa += 1) {
    const codigo = randomBytes(6).toString("hex").toUpperCase();
    const snap = await db.collection("codigosMaker").doc(codigo).get();
    if (!snap.exists) return codigo;
  }
  throw new functions.https.HttpsError("resource-exhausted", "CODIGO_MAKER_INDISPONIVEL");
}

function normalizarCodigoMaker(valor) {
  const texto = String(valor || "").trim();
  const match = texto.match(/maker\/aluno\/([A-Z0-9]+)/i);
  return String(match?.[1] || texto).toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function dataAtualSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((parte) => parte.type === tipo)?.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

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
