import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "./firebase";
import { listarTurmasProfessor } from "./firebaseTurmas";

export const REGRAS_MAKER_PADRAO = [
  "Cada aula pode render níveis e Maker Coins definidos pelo professor.",
  "Duas faltas consecutivas podem retirar um nível.",
  "O ajudante do dia recebe 2 Maker Coins extras se estiver presente.",
  "Faltas podem ser justificadas e dependem da aprovação do professor.",
  "Maker Coins são usadas apenas na Loja Maker da turma.",
];

export async function obterQrMaker() {
  const usuario = auth.currentUser;
  if (!usuario) throw new Error("USUARIO_NAO_LOGADO");

  const alunoRef = doc(db, "usuarios", usuario.uid);
  const alunoSnap = await getDoc(alunoRef);
  if (alunoSnap.data()?.tipo !== "aluno_maker") {
    throw new Error("ALUNO_MAKER_OBRIGATORIO");
  }

  const makerRef = doc(db, "makerPerfis", usuario.uid);
  const makerSnap = await getDoc(makerRef);
  const codigo = makerSnap.data()?.codigo || gerarCodigoMaker();

  await setDoc(makerRef, { alunoId: usuario.uid, codigo, atualizadoEm: serverTimestamp() }, { merge: true });
  await setDoc(doc(db, "codigosMaker", codigo), {
    alunoId: usuario.uid,
    nome: alunoSnap.data()?.nome || usuario.displayName || "Aluno Maker",
    tipo: "aluno_maker",
    materias: { maker: alunoSnap.data()?.materias?.maker || {} },
    ativo: true,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
  return { codigo };
}

export async function registrarPresencaMaker({ turmaId, valorQr }) {
  const professor = auth.currentUser;
  if (!professor) throw new Error("USUARIO_NAO_LOGADO");
  const codigo = extrairCodigoQrMaker(valorQr);
  const [professorSnap, turmaSnap, codigoSnap] = await Promise.all([
    getDoc(doc(db, "usuarios", professor.uid)),
    getDoc(doc(db, "turmas", turmaId)),
    getDoc(doc(db, "codigosMaker", codigo)),
  ]);
  if (professorSnap.data()?.tipo !== "professor" || turmaSnap.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const alunoId = codigoSnap.data()?.alunoId;
  if (!alunoId || codigoSnap.data()?.ativo === false) throw new Error("ALUNO_NAO_ENCONTRADO");
  // O perfil completo do aluno é privado. Para a chamada, os dados mínimos já
  // estão no índice do QR e o professor só precisa confirmar o vínculo da turma.
  const vinculoSnap = await getDoc(doc(db, "turmas", turmaId, "alunos", alunoId));
  if (codigoSnap.data()?.tipo !== "aluno_maker") throw new Error("ALUNO_NAO_ENCONTRADO");
  if (!vinculoSnap.exists()) throw new Error("ALUNO_FORA_DA_TURMA");
  const data = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const presencaRef = doc(db, "turmas", turmaId, "chamadasMaker", data, "presencas", alunoId);
  const jaRegistrado = (await getDoc(presencaRef)).exists();
  const alunoNome = codigoSnap.data()?.nome || vinculoSnap.data()?.nome || "Aluno Maker";
  if (!jaRegistrado) await setDoc(presencaRef, { alunoId, alunoNome, presente: true, registradoPor: professor.uid, registradoEm: serverTimestamp() });
  return { alunoNome, jaRegistrado, data };
}

export async function listarTurmasMakerProfessor() {
  const turmas = await listarTurmasProfessor();
  return turmas
    .filter((turma) => turma.tipo !== "regular")
    .map((turma) => ({ id: turma.id, nome: turma.nome, tipo: turma.tipo || "mista", totalAlunos: turma.alunos?.length || 0 }));
}

export async function carregarPerfilMaker(uid = auth.currentUser?.uid) {
  if (!uid) throw new Error("USUARIO_NAO_LOGADO");
  const snap = await getDoc(doc(db, "makerPerfis", uid));
  return {
    nivel: snap.data()?.nivel || 1,
    moedas: snap.data()?.moedas || 0,
    faltasConsecutivas: snap.data()?.faltasConsecutivas || 0,
    faltasTotal: snap.data()?.faltasTotal || 0,
    referidoPor: snap.data()?.referidoPor || null,
    turmaIndicacaoId: snap.data()?.turmaIndicacaoId || null,
    bonusIndicacaoEntregue: snap.data()?.bonusIndicacaoEntregue === true,
  };
}

export async function carregarConfiguracoesMaker(turmaId) {
  const snap = await getDoc(doc(db, "turmas", turmaId, "configMaker", "regras"));
  return { moedasPorPresenca: snap.data()?.moedasPorPresenca ?? 2, niveisPorPresenca: snap.data()?.niveisPorPresenca ?? 1, bonusIndicacao: snap.data()?.bonusIndicacao ?? 3, regras: snap.data()?.regras?.length ? snap.data().regras : REGRAS_MAKER_PADRAO };
}

export async function salvarConfiguracoesMaker({ turmaId, moedasPorPresenca, niveisPorPresenca, bonusIndicacao, regras = REGRAS_MAKER_PADRAO }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const regrasLimpas = (regras || []).map((regra) => String(regra).trim()).filter(Boolean);
  if (!regrasLimpas.length) throw new Error("REGRAS_VAZIAS");
  await setDoc(doc(db, "turmas", turmaId, "configMaker", "regras"), { moedasPorPresenca: Math.max(0, Number(moedasPorPresenca)), niveisPorPresenca: Math.max(0, Number(niveisPorPresenca)), bonusIndicacao: Math.max(0, Number(bonusIndicacao)), regras: regrasLimpas, atualizadoEm: serverTimestamp() }, { merge: true });
}

export async function carregarCuriosidadeMaker(turmaId) {
  const snap = await getDoc(doc(db, "turmas", turmaId, "conteudoMaker", "curiosidadeDoDia"));
  return snap.exists() ? snap.data() : null;
}

export async function salvarCuriosidadeMaker({ turmaId, alunoId, alunoNome }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  if (!alunoId || !String(alunoNome).trim()) throw new Error("ALUNO_CURIOSIDADE_INVALIDO");
  await setDoc(doc(db, "turmas", turmaId, "conteudoMaker", "curiosidadeDoDia"), {
    titulo: "Curiosidade do dia", texto: "", alunoId, alunoNome: String(alunoNome).trim(), professorId: professor.uid,
    atualizadoEm: serverTimestamp(),
  });
}

export async function listarRoletasMaker(turmaId) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const snap = await getDocs(collection(db, "turmas", turmaId, "roletasMaker"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function criarRoletaMaker({ turmaId, titulo, opcoes }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const itens = (opcoes || []).map((item) => String(item).trim()).filter(Boolean);
  if (!String(titulo).trim() || itens.length < 2) throw new Error("ROLETA_INVALIDA");
  await setDoc(doc(collection(db, "turmas", turmaId, "roletasMaker")), {
    titulo: String(titulo).trim(), opcoes: itens, professorId: professor.uid,
    criadaEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
  });
}

export async function registrarIndicacaoMaker({ turmaId, alunoIndicadoId, alunoIndicadorId }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  if (alunoIndicadoId === alunoIndicadorId) throw new Error("INDICACAO_INVALIDA");
  await setDoc(doc(db, "makerPerfis", alunoIndicadoId), { referidoPor: alunoIndicadorId, turmaIndicacaoId: turmaId, bonusIndicacaoEntregue: false, ultimaTurmaId: turmaId, atualizadoEm: serverTimestamp() }, { merge: true });
}

export async function listarHistoricoMaker() {
  const aluno = auth.currentUser; if (!aluno) throw new Error("USUARIO_NAO_LOGADO");
  const [movimentos, ocorrencias] = await Promise.all([getDocs(collection(db, "makerPerfis", aluno.uid, "movimentos")), getDocs(collection(db, "makerPerfis", aluno.uid, "ocorrencias"))]);
  return [...movimentos.docs.map((item) => ({ id: item.id, categoria: "movimento", ...item.data() })), ...ocorrencias.docs.map((item) => ({ id: item.id, categoria: "ocorrencia", ...item.data() }))];
}

export async function finalizarChamadaMaker({ turmaId, moedasPorPresenca = 2, niveisPorPresenca = 1, recompensasExtras = [] }) {
  const professor = auth.currentUser;
  if (!professor) throw new Error("USUARIO_NAO_LOGADO");
  const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
  if (turmaSnap.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");

  const data = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const chamadaRef = doc(db, "turmas", turmaId, "chamadasMaker", data);
  if ((await getDoc(chamadaRef)).data()?.finalizada) {
    throw new Error("AULA_JA_FINALIZADA");
  }
  const [alunosSnap, presencasSnap] = await Promise.all([
    getDocs(collection(db, "turmas", turmaId, "alunos")),
    getDocs(collection(db, "turmas", turmaId, "chamadasMaker", data, "presencas")),
  ]);
  const ajudanteSnap = await getDoc(doc(db, "turmas", turmaId, "ajudantesMaker", data));
  const regras = await carregarConfiguracoesMaker(turmaId);
  const ajudanteId = ajudanteSnap.data()?.alunoId || null;
  const presentes = new Set(presencasSnap.docs.map((item) => item.id));
  const extras = (recompensasExtras || []).map((recompensa) => ({
    titulo: String(recompensa.titulo || "").trim(), moedas: Number(recompensa.moedas),
    geral: recompensa.geral === true, alunoIds: recompensa.alunoIds || [],
  })).filter((recompensa) => recompensa.titulo && Number.isFinite(recompensa.moedas) && recompensa.moedas > 0);
  const resultado = { presentes: 0, faltas: 0 };

  for (const vinculo of alunosSnap.docs) {
    const alunoId = vinculo.id;
    if (vinculo.data()?.tipo !== "aluno_maker") continue;
    const perfilRef = doc(db, "makerPerfis", alunoId);
    const perfil = await carregarPerfilMaker(alunoId);
    const presente = presentes.has(alunoId);
    const faltasConsecutivas = presente ? 0 : perfil.faltasConsecutivas + 1;
    const perdeNivel = !presente && faltasConsecutivas >= 2;
    const eAjudante = presente && alunoId === ajudanteId;
    const bonusIndicacao = presente && perfil.referidoPor && perfil.turmaIndicacaoId === turmaId && !perfil.bonusIndicacaoEntregue ? regras.bonusIndicacao : 0;
    const extrasDoAluno = presente ? extras.filter((recompensa) => recompensa.geral || recompensa.alunoIds.includes(alunoId)) : [];
    const moedasExtras = extrasDoAluno.reduce((total, recompensa) => total + recompensa.moedas, 0);
    const moedasRecebidas = presente ? Number(moedasPorPresenca) + (eAjudante ? 2 : 0) + moedasExtras : 0;
    const niveisRecebidos = presente ? Number(niveisPorPresenca) : perdeNivel ? -1 : 0;
    const novoNivel = Math.max(1, perfil.nivel + niveisRecebidos);
    await setDoc(perfilRef, {
      alunoId,
      nivel: novoNivel,
      moedas: Math.max(0, perfil.moedas + moedasRecebidas),
      faltasConsecutivas,
      faltasTotal: perfil.faltasTotal + (presente ? 0 : 1),
      ultimaTurmaId: turmaId,
      bonusIndicacaoEntregue: perfil.bonusIndicacaoEntregue || !!bonusIndicacao,
      atualizadoEm: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, "makerPerfis", alunoId, "movimentos", `${turmaId}_${data}`), {
      turmaId, data, presente, tipo: presente ? "aula" : "falta", moedas: moedasRecebidas,
      niveis: niveisRecebidos, ajudante: eAjudante, recompensasExtras: extrasDoAluno.map((recompensa) => ({ titulo: recompensa.titulo, moedas: recompensa.moedas })), registradoPor: professor.uid, criadoEm: serverTimestamp(),
    });
    if (bonusIndicacao) {
      const indicador = await carregarPerfilMaker(perfil.referidoPor);
      await setDoc(doc(db, "makerPerfis", perfil.referidoPor), { moedas: indicador.moedas + bonusIndicacao, ultimaTurmaId: turmaId, atualizadoEm: serverTimestamp() }, { merge: true });
      await setDoc(doc(collection(db, "makerPerfis", perfil.referidoPor, "movimentos")), { turmaId, data, tipo: "indicacao", moedas: bonusIndicacao, niveis: 0, alunoIndicadoId: alunoId, registradoPor: professor.uid, criadoEm: serverTimestamp() });
    }
    resultado[presente ? "presentes" : "faltas"] += 1;
  }
  await setDoc(chamadaRef, { finalizada: true, finalizadaEm: serverTimestamp() }, { merge: true });
  return resultado;
}

export async function sortearAjudanteMaker(turmaId) {
  const professor = auth.currentUser;
  if (!professor) throw new Error("USUARIO_NAO_LOGADO");
  const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
  if (turmaSnap.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");

  const data = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  if ((await getDoc(doc(db, "turmas", turmaId, "chamadasMaker", data))).data()?.finalizada) {
    throw new Error("AULA_JA_FINALIZADA");
  }
  const ajudanteRef = doc(db, "turmas", turmaId, "ajudantesMaker", data);
  const ajudanteAtual = await getDoc(ajudanteRef);
  if (ajudanteAtual.exists()) return { ...ajudanteAtual.data(), jaSorteado: true };
  const configuracaoRef = doc(db, "turmas", turmaId, "configMaker", "ajudantes");
  const configuracao = await getDoc(configuracaoRef);
  const ciclo = configuracao.data()?.cicloAjudantes || 0;

  const [alunosSnap, historicoSnap, presencasSnap] = await Promise.all([
    getDocs(collection(db, "turmas", turmaId, "alunos")),
    getDocs(collection(db, "turmas", turmaId, "ajudantesMaker")),
    getDocs(collection(db, "turmas", turmaId, "chamadasMaker", data, "presencas")),
  ]);
  const jaForamAjudantes = new Set(historicoSnap.docs
    .filter((item) => (item.data().ciclo || 0) === ciclo)
    .map((item) => item.data().alunoId));
  const presentes = new Set(presencasSnap.docs.map((item) => item.id));
  const candidatos = alunosSnap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((aluno) => aluno.tipo === "aluno_maker" && presentes.has(aluno.id) && !jaForamAjudantes.has(aluno.id));
  if (!candidatos.length) throw new Error("SEM_CANDIDATOS_AJUDANTE");

  const escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
  await setDoc(ajudanteRef, {
    alunoId: escolhido.id, alunoNome: escolhido.nome || "Aluno Maker", data, ciclo,
    sorteadoPor: professor.uid, sorteadoEm: serverTimestamp(),
  }, { merge: false });
  return { alunoId: escolhido.id, alunoNome: escolhido.nome || "Aluno Maker", data, jaSorteado: false };
}

export async function renovarListaAjudantesMaker(turmaId) {
  const professor = auth.currentUser;
  if (!professor) throw new Error("USUARIO_NAO_LOGADO");
  const turmaSnap = await getDoc(doc(db, "turmas", turmaId));
  if (turmaSnap.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const configuracaoRef = doc(db, "turmas", turmaId, "configMaker", "ajudantes");
  const configuracao = await getDoc(configuracaoRef);
  const proximoCiclo = (configuracao.data()?.cicloAjudantes || 0) + 1;
  await setDoc(configuracaoRef, { cicloAjudantes: proximoCiclo, renovadoPor: professor.uid, renovadoEm: serverTimestamp() }, { merge: true });
  return proximoCiclo;
}

export async function enviarJustificativaMaker({ turmaId, data, texto }) {
  const aluno = auth.currentUser;
  const motivo = String(texto || "").trim();
  if (!aluno) throw new Error("USUARIO_NAO_LOGADO");
  if (motivo.length < 10) throw new Error("JUSTIFICATIVA_CURTA");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data || ""))) throw new Error("DATA_INVALIDA");
  const vinculo = await getDoc(doc(db, "turmas", turmaId, "alunos", aluno.uid));
  if (!vinculo.exists()) throw new Error("ALUNO_FORA_DA_TURMA");
  await setDoc(doc(collection(db, "turmas", turmaId, "justificativasMaker")), {
    alunoId: aluno.uid, alunoNome: vinculo.data()?.nome || "Aluno Maker", data,
    texto: motivo, status: "pendente", criadoEm: serverTimestamp(),
  });
}

export async function listarJustificativasMaker(turmaId) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "justificativasMaker"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")));
}

export async function listarMinhasJustificativasMaker(turmaId) {
  const aluno = auth.currentUser;
  if (!aluno) throw new Error("USUARIO_NAO_LOGADO");
  const snap = await getDocs(query(collection(db, "turmas", turmaId, "justificativasMaker"), where("alunoId", "==", aluno.uid)));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function decidirJustificativaMaker({ turmaId, justificativaId, aprovada, comentario = "" }) {
  const professor = auth.currentUser;
  if (!professor) throw new Error("USUARIO_NAO_LOGADO");
  const turma = await getDoc(doc(db, "turmas", turmaId));
  if (turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const justificativaRef = doc(db, "turmas", turmaId, "justificativasMaker", justificativaId);
  const justificativaSnap = await getDoc(justificativaRef);
  const justificativa = justificativaSnap.data();
  if (!justificativaSnap.exists() || justificativa.status !== "pendente") throw new Error("JUSTIFICATIVA_JA_ANALISADA");

  await updateDoc(justificativaRef, { status: aprovada ? "aprovada" : "recusada", comentario: String(comentario).trim(), analisadaPor: professor.uid, analisadaEm: serverTimestamp() });
  if (!aprovada) return;

  const perfil = await carregarPerfilMaker(justificativa.alunoId);
  const movimentoRef = doc(db, "makerPerfis", justificativa.alunoId, "movimentos", `${turmaId}_${justificativa.data}`);
  const movimento = (await getDoc(movimentoRef)).data();
  const niveisDevolvidos = movimento?.niveis === -1 ? 1 : 0;
  await setDoc(doc(db, "makerPerfis", justificativa.alunoId), {
    nivel: perfil.nivel + niveisDevolvidos,
    faltasTotal: Math.max(0, perfil.faltasTotal - 1),
    faltasConsecutivas: 0,
    ultimaTurmaId: turmaId,
    atualizadoEm: serverTimestamp(),
  }, { merge: true });
  await setDoc(doc(collection(db, "makerPerfis", justificativa.alunoId, "movimentos")), {
    turmaId, data: justificativa.data, tipo: "justificativa_aprovada", moedas: 0,
    niveis: niveisDevolvidos, registradoPor: professor.uid, criadoEm: serverTimestamp(),
  });
}

export async function listarProdutosMaker(turmaId) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "produtosMaker"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.ativo !== false);
}

export async function atualizarProdutoMaker({ turmaId, produtoId, nome, descricao, preco, estoque, ativo }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  await updateDoc(doc(db, "turmas", turmaId, "produtosMaker", produtoId), { nome: String(nome).trim(), descricao: String(descricao || "").trim(), preco: Math.max(0, Number(preco)), estoque: estoque === "" ? null : Math.max(0, Number(estoque)), ativo: ativo !== false, atualizadoEm: serverTimestamp() });
}

export async function criarProdutoMaker({ turmaId, turmaIds, nome, descricao, preco, estoque }) {
  const professor = auth.currentUser;
  const destinos = [...new Set((turmaIds?.length ? turmaIds : [turmaId]).filter(Boolean))];
  const turmas = await Promise.all(destinos.map((id) => getDoc(doc(db, "turmas", id))));
  if (!professor || !destinos.length || turmas.some((turma) => turma.data()?.professorId !== professor.uid)) throw new Error("SEM_PERMISSAO");
  if (!String(nome).trim() || Number(preco) < 0) throw new Error("PRODUTO_INVALIDO");
  const produto = { nome: String(nome).trim(), descricao: String(descricao || "").trim(), preco: Number(preco), estoque: estoque === "" ? null : Number(estoque), ativo: true, criadoPor: professor.uid, criadoEm: serverTimestamp() };
  await Promise.all(destinos.map((id) => setDoc(doc(collection(db, "turmas", id, "produtosMaker")), produto)));
  return destinos.length;
}

export async function comprarProdutoMaker({ turmaId, produtoId }) {
  const aluno = auth.currentUser;
  if (!aluno) throw new Error("USUARIO_NAO_LOGADO");
  const [produtoSnap, perfil] = await Promise.all([getDoc(doc(db, "turmas", turmaId, "produtosMaker", produtoId)), carregarPerfilMaker()]);
  const produto = produtoSnap.data();
  if (!produtoSnap.exists() || produto.ativo === false) throw new Error("PRODUTO_INDISPONIVEL");
  if (produto.estoque !== null && produto.estoque <= 0) throw new Error("SEM_ESTOQUE");
  if (perfil.moedas < produto.preco) throw new Error("COINS_INSUFICIENTES");
  // Sem API, a compra vira solicitação: só o professor confirma o desconto e o estoque.
  await setDoc(doc(collection(db, "turmas", turmaId, "pedidosMaker")), { alunoId: aluno.uid, produtoId, produtoNome: produto.nome, preco: produto.preco, status: "pendente", criadoEm: serverTimestamp() });
}

export async function listarPedidosMaker(turmaId, apenasPendentes = true) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "pedidosMaker"));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => !apenasPendentes || item.status === "pendente");
}

export async function decidirPedidoMaker({ turmaId, pedidoId, aprovar, comentario = "" }) {
  const professor = auth.currentUser;
  const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const pedidoRef = doc(db, "turmas", turmaId, "pedidosMaker", pedidoId);
  const pedidoSnap = await getDoc(pedidoRef); const pedido = pedidoSnap.data();
  if (!pedidoSnap.exists() || pedido.status !== "pendente") throw new Error("PEDIDO_JA_ANALISADO");
  if (!aprovar) { await updateDoc(pedidoRef, { status: "recusado", comentario: String(comentario).trim(), analisadoPor: professor.uid, analisadoEm: serverTimestamp() }); return; }
  const [perfil, produtoSnap] = await Promise.all([carregarPerfilMaker(pedido.alunoId), getDoc(doc(db, "turmas", turmaId, "produtosMaker", pedido.produtoId))]);
  const produto = produtoSnap.data();
  if (!produtoSnap.exists() || produto.ativo === false || (produto.estoque !== null && produto.estoque <= 0)) throw new Error("PRODUTO_INDISPONIVEL");
  if (perfil.moedas < pedido.preco) throw new Error("COINS_INSUFICIENTES");
  await setDoc(doc(db, "makerPerfis", pedido.alunoId), { moedas: perfil.moedas - pedido.preco, ultimaTurmaId: turmaId, atualizadoEm: serverTimestamp() }, { merge: true });
  if (produto.estoque !== null) await updateDoc(produtoSnap.ref, { estoque: increment(-1) });
  await updateDoc(pedidoRef, { status: "aprovado", comentario: String(comentario).trim(), analisadoPor: professor.uid, analisadoEm: serverTimestamp() });
  await setDoc(doc(collection(db, "makerPerfis", pedido.alunoId, "movimentos")), { turmaId, tipo: "compra", moedas: -pedido.preco, niveis: 0, produtoNome: pedido.produtoNome, registradoPor: professor.uid, criadoEm: serverTimestamp() });
}

export async function listarHistoricoProfessorMaker({ turmaId, alunoId }) {
  const professor = auth.currentUser; const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const [observacoes, ocorrencias, movimentos, pedidos] = await Promise.all([getDocs(collection(db, "turmas", turmaId, "observacoesMaker")), getDocs(collection(db, "makerPerfis", alunoId, "ocorrencias")), getDocs(collection(db, "makerPerfis", alunoId, "movimentos")), getDocs(collection(db, "turmas", turmaId, "pedidosMaker"))]);
  return {
    observacoes: observacoes.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.alunoId === alunoId),
    ocorrencias: ocorrencias.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.turmaId === turmaId),
    movimentos: movimentos.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.turmaId === turmaId),
    compras: pedidos.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.alunoId === alunoId),
  };
}

export async function registrarOcorrenciaMaker({ turmaId, alunoId, motivo, moedas = 0, niveis = 0, observacao = "" }) {
  const professor = auth.currentUser;
  const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  const perfil = await carregarPerfilMaker(alunoId);
  const descontoMoedas = Math.max(0, Number(moedas)); const descontoNiveis = Math.max(0, Number(niveis));
  await setDoc(doc(db, "makerPerfis", alunoId), { moedas: Math.max(0, perfil.moedas - descontoMoedas), nivel: Math.max(1, perfil.nivel - descontoNiveis), ultimaTurmaId: turmaId, atualizadoEm: serverTimestamp() }, { merge: true });
  await setDoc(doc(collection(db, "makerPerfis", alunoId, "ocorrencias")), { turmaId, motivo: String(motivo).trim(), observacao: String(observacao).trim(), moedas: descontoMoedas, niveis: descontoNiveis, professorId: professor.uid, criadoEm: serverTimestamp() });
}

export async function salvarObservacaoMaker({ turmaId, alunoId, texto }) {
  const professor = auth.currentUser;
  const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");
  if (!String(texto).trim()) throw new Error("OBSERVACAO_VAZIA");
  await setDoc(doc(collection(db, "turmas", turmaId, "observacoesMaker")), { alunoId, texto: String(texto).trim(), professorId: professor.uid, criadoEm: serverTimestamp() });
}

export async function listarAlunosMakerDaTurma(turmaId) {
  const snap = await getDocs(collection(db, "turmas", turmaId, "alunos"));
  const alunos = snap.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => item.tipo === "aluno_maker");
  return Promise.all(alunos.map(async (aluno) => ({ ...aluno, maker: await carregarPerfilMaker(aluno.id) })));
}

export async function listarBuscaAtivaMaker(turmaId, limiteDeFaltas = 3) {
  // A Busca Ativa é calculada por turma. Isso evita somar faltas de outras
  // turmas em que o mesmo Aluno Maker também esteja matriculado.
  const professor = auth.currentUser;
  const turma = await getDoc(doc(db, "turmas", turmaId));
  if (!professor || turma.data()?.professorId !== professor.uid) throw new Error("SEM_PERMISSAO");

  const [alunosSnap, justificativasSnap] = await Promise.all([
    getDocs(collection(db, "turmas", turmaId, "alunos")),
    getDocs(collection(db, "turmas", turmaId, "justificativasMaker")),
  ]);
  const faltasJustificadas = new Set(
    justificativasSnap.docs
      .map((item) => item.data())
      .filter((item) => item.status === "aprovada" && item.alunoId && item.data)
      .map((item) => `${item.alunoId}_${item.data}`)
  );
  const alunosMaker = alunosSnap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.tipo === "aluno_maker");

  const alunosComFaltas = await Promise.all(alunosMaker.map(async (aluno) => {
    const movimentos = await getDocs(collection(db, "makerPerfis", aluno.id, "movimentos"));
    const faltas = movimentos.docs
      .map((item) => item.data())
      .filter((item) => item.turmaId === turmaId && item.tipo === "falta" && item.data)
      .filter((item) => !faltasJustificadas.has(`${aluno.id}_${item.data}`)).length;
    return { ...aluno, faltas };
  }));

  return alunosComFaltas
    .filter((aluno) => aluno.faltas >= limiteDeFaltas)
    .sort((a, b) => b.faltas - a.faltas || String(a.nome || "").localeCompare(String(b.nome || "")));
}

export async function listarAlunosMakerBasicosDaTurma(turmaId) {
  // Dinâmicas como a roleta precisam somente dos nomes, não do perfil privado.
  const snap = await getDocs(collection(db, "turmas", turmaId, "alunos"));
  return snap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.tipo === "aluno_maker");
}

export async function listarAlunosMakerPresentesDaTurma(turmaId) {
  const data = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const [alunosSnap, presencasSnap] = await Promise.all([
    getDocs(collection(db, "turmas", turmaId, "alunos")),
    getDocs(collection(db, "turmas", turmaId, "chamadasMaker", data, "presencas")),
  ]);
  const presentes = new Set(presencasSnap.docs.filter((item) => item.data()?.presente !== false).map((item) => item.id));
  return alunosSnap.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.tipo === "aluno_maker" && presentes.has(item.id));
}

function gerarCodigoMaker() {
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 10 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join("");
}

export function montarValorQrMaker(codigo) {
  return `gamestudando://maker/aluno/${codigo}`;
}

export function extrairCodigoQrMaker(valor) {
  const texto = String(valor || "").trim();
  const match = texto.match(/maker\/aluno\/([A-Z0-9]+)/i);

  return (match?.[1] || texto)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function mensagemErroMaker(error) {
  const codigo = error?.code || "";
  const mensagem = error?.message || "";

  if (codigo.includes("permission-denied") || mensagem.includes("SEM_PERMISSAO")) {
    return "Você não tem permissão para registrar esta chamada.";
  }
  if (mensagem.includes("ALUNO_NAO_ENCONTRADO")) {
    return "Este QR não pertence a um Aluno Maker.";
  }
  if (mensagem.includes("ALUNO_FORA_DA_TURMA")) {
    return "Este aluno não está vinculado à turma selecionada.";
  }
  if (mensagem.includes("TURMA_NAO_ENCONTRADA")) {
    return "Selecione uma turma válida.";
  }
  if (mensagem.includes("AULA_JA_FINALIZADA")) {
    return "A chamada de hoje já foi finalizada.";
  }
  if (mensagem.includes("JUSTIFICATIVA_JA_ANALISADA")) {
    return "Esta justificativa já foi analisada.";
  }
  if (mensagem.includes("SEM_CANDIDATOS_AJUDANTE")) {
    return "Não há aluno presente disponível para o sorteio.";
  }
  return "Não foi possível concluir a chamada agora.";
}
