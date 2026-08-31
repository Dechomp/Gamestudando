import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "./firebase";
import {
  carregarPerfil,
  limparPerfilLocal,
  salvarPerfil
} from "./perfilAluno";
import {
  carregarPerfilFirebase,
  criarOuAtualizarAlunoFirebase
} from "./firebasePerfil";
import { sincronizarPerguntasIniciais } from "./repositorioQuestoes";

const CHAVE_SESSAO_ALUNO = "sessaoAlunoIniciadaEm";
const DURACAO_SESSAO_ALUNO_MS = 12 * 60 * 60 * 1000;

export function observarUsuarioLogado(callback) {
  return onAuthStateChanged(auth, callback);
}

// Pega o usuario que esta logado no Firebase Auth.
export function obterUsuarioLogado() {
  return auth.currentUser;
}

// Decide a primeira tela de acordo com o tipo da conta.
export function obterRotaInicialPorPerfil(perfil) {
  if (!perfil) return "/Auth/tipoContaGoogle";
  if (perfil?.tipo === "professor") return "/Professor/RelatorioProfessor";
  if (perfil?.tipo === "responsavel") return "/Responsavel/PerfilResponsavel";
  if (perfil?.tipo === "aluno_maker") return "/Aluno/aguardandoTurmaMaker";
  if (!perfil?.progresso?.avaliacaoInicialConcluida) {
    return "/Aluno/avaliacaoInicial";
  }

  return "/Aluno";
}

export async function cadastrarAlunoEmail({ nome, email, senha, tipo = "aluno", usuario = "" }) {
  // Cria a conta no Firebase Auth usando email e senha.
  const credencial = await createUserWithEmailAndPassword(
    auth,
    criarEmailAutenticacao(email, usuario, tipo),
    senha
  );

  const usuarioFirebase = credencial.user;

  await updateProfile(usuarioFirebase, {
    displayName: nome.trim()
  });

  if (tipo !== "aluno_maker") await sendEmailVerification(usuarioFirebase);

  // Monta o perfil inicial que sera salvo localmente e no Firestore.
  const perfilAtual = await carregarPerfil();
  const perfilAluno = {
    ...perfilAtual,
    uid: usuarioFirebase.uid,
    tipo,
    nome: nome.trim(),
    email: tipo === "aluno_maker" ? null : usuarioFirebase.email,
    usuario: tipo === "aluno_maker" ? normalizarUsuario(usuario) : null,
    progresso: {
      ...(perfilAtual.progresso || {}),
      avaliacaoInicialConcluida: tipo === "aluno" ? false : true,
      avaliacaoInicialConcluidaEm: null
    }
  };

  await salvarPerfil(perfilAluno);
  await criarOuAtualizarAlunoFirebase(usuarioFirebase.uid, perfilAluno, {
    merge: false
  });
  sincronizarPerguntasIniciais().catch(() => {});
  await registrarInicioSessaoAluno(usuarioFirebase.uid, tipo);

  return {
    usuario: usuarioFirebase,
    perfil: perfilAluno
  };
}

export async function carregarPerfilUsuarioAtual({ criarSeNaoExistir = true } = {}) {
  const usuario = auth.currentUser;

  if (!usuario) return null;

  // Primeiro tenta buscar no Firestore, depois cria um perfil novo se precisar.
  const perfilFirebase = await carregarPerfilFirebase(usuario.uid);
  const perfilLocal = perfilFirebase
    ? converterPerfilFirebaseParaLocal(perfilFirebase)
    : criarSeNaoExistir
      ? await criarPerfilParaUsuario(usuario)
      : null;

  if (!perfilLocal) return null;

  await salvarPerfil(perfilLocal);

  return perfilLocal;
}

export async function entrarEmailSenha(email, senha) {
  // Valida o login no Firebase Auth.
  const credencial = await signInWithEmailAndPassword(
    auth,
    email.includes("@") ? email.trim() : criarEmailAutenticacao("", email, "aluno_maker"),
    senha
  );

  const usuario = credencial.user;
  const perfilLocal = await carregarPerfilUsuarioAtual();
  await registrarInicioSessaoAluno(usuario.uid, perfilLocal?.tipo);
  sincronizarPerguntasIniciais().catch(() => {});

  return {
    usuario,
    perfil: perfilLocal
  };
}

export async function entrarComCredencialGoogle(idToken) {
  // Usa o token do Google para criar uma credencial aceita pelo Firebase.
  const credencialGoogle = GoogleAuthProvider.credential(idToken);
  const credencial = await signInWithCredential(auth, credencialGoogle);
  const perfilLocal = await carregarPerfilUsuarioAtual({
    criarSeNaoExistir: false
  });
  sincronizarPerguntasIniciais().catch(() => {});
  await registrarInicioSessaoAluno(credencial.user.uid, perfilLocal?.tipo);

  return {
    usuario: credencial.user,
    perfil: perfilLocal,
    precisaEscolherTipo: !perfilLocal
  };
}

export async function finalizarCadastroGoogle({ tipo }) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Usuario nao logado.");
  }

  // Depois do primeiro login com Google, salva o tipo escolhido pelo usuario.
  const perfil = await criarPerfilParaUsuario(usuario, tipo);
  await salvarPerfil(perfil);
  sincronizarPerguntasIniciais().catch(() => {});

  return perfil;
}

export async function enviarEmailRecuperacaoSenha(email) {
  const emailTratado = email.trim();

  if (!emailTratado) {
    throw new Error("EMAIL_RECUPERACAO_VAZIO");
  }

  await sendPasswordResetEmail(auth, emailTratado);
}

export async function sairDaConta() {
  const googleSignin = obterGoogleSignin();

  // Limpa Google, Firebase e perfil local para nao misturar contas.
  await googleSignin?.revokeAccess?.().catch(() => {});
  await googleSignin?.signOut?.().catch(() => {});
  await signOut(auth);
  await AsyncStorage.removeItem(CHAVE_SESSAO_ALUNO);
  await limparPerfilLocal();
}

async function registrarInicioSessaoAluno(uid, tipo) {
  if (tipo !== "aluno" && tipo !== "aluno_maker") return;
  await AsyncStorage.setItem(CHAVE_SESSAO_ALUNO, JSON.stringify({ uid, iniciadoEm: Date.now() }));
}

export async function sessaoDeAlunoExpirou(uid, tipo) {
  if (tipo !== "aluno" && tipo !== "aluno_maker") return false;
  const valor = await AsyncStorage.getItem(CHAVE_SESSAO_ALUNO);
  if (!valor) return false;
  try {
    const sessao = JSON.parse(valor);
    return sessao.uid === uid && Date.now() - Number(sessao.iniciadoEm) >= DURACAO_SESSAO_ALUNO_MS;
  } catch { return false; }
}

export async function atualizarEmailConta(novoEmail) {
  if (!auth.currentUser) {
    throw new Error("Usuario nao logado.");
  }

  const emailTratado = novoEmail.trim();

  if (auth.currentUser.email === emailTratado) {
    return;
  }

  await updateEmail(auth.currentUser, emailTratado);
  await sendEmailVerification(auth.currentUser);
}

export async function atualizarSenhaConta(novaSenha) {
  if (!auth.currentUser) {
    throw new Error("Usuario nao logado.");
  }

  await updatePassword(auth.currentUser, novaSenha);
}

async function criarPerfilParaUsuario(usuario, tipo = "aluno") {
  // Cria um perfil compativel com aluno, professor ou responsavel.
  const perfilAtual = await carregarPerfil();
  const perfilAluno = {
    ...perfilAtual,
    uid: usuario.uid,
    tipo,
    nome: usuario.displayName || "Aluno",
    email: tipo === "aluno_maker" ? null : usuario.email || null,
    progresso: {
      ...(perfilAtual.progresso || {}),
      avaliacaoInicialConcluida: tipo === "aluno" ? false : true,
      avaliacaoInicialConcluidaEm: null
    }
  };

  await criarOuAtualizarAlunoFirebase(usuario.uid, perfilAluno, {
    merge: false
  });

  return perfilAluno;
}

function converterPerfilFirebaseParaLocal(perfilFirebase) {
  // Converte a estrutura do Firestore para o formato usado nas telas.
  return {
    uid: perfilFirebase.uid,
    tipo: perfilFirebase.tipo || "aluno",
    nome: perfilFirebase.nome || "Aluno",
    email: perfilFirebase.email || null,
    usuario: perfilFirebase.usuario || null,
    cpf: perfilFirebase.cpf || null,
    telefone: perfilFirebase.telefone || null,
    dataNascimento: perfilFirebase.dataNascimento || null,
    status: perfilFirebase.status || "ativo",
    isVerificado: perfilFirebase.isVerificado ?? true,
    responsavelId: perfilFirebase.responsavelId || null,
    configuracoes: perfilFirebase.configuracoes || {
      leituraPerguntasAtiva: true
    },
    progresso: perfilFirebase.progresso || {
      faseLiberada: 1,
      maiorFaseConcluida: 0,
      faseLiberadaMaker: 1,
      maiorFaseMakerConcluida: 0,
      avaliacaoInicialConcluida: false,
      avaliacaoInicialConcluidaEm: null,
      materiasPorFase: {}
    },
    matematica: perfilFirebase.materias?.matematica || {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },
    portugues: perfilFirebase.materias?.portugues || {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },
    rimas: perfilFirebase.materias?.rimas || {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },
    maker: perfilFirebase.materias?.maker || {
      nivel: 1,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },
    estatisticas: perfilFirebase.estatisticas || {}
  };
}

function normalizarUsuario(usuario) {
  return String(usuario || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

function criarEmailAutenticacao(email, usuario, tipo) {
  if (tipo !== "aluno_maker") return String(email || "").trim();
  const usuarioNormalizado = normalizarUsuario(usuario);
  if (usuarioNormalizado.length < 3) throw new Error("USUARIO_INVALIDO");
  return `${usuarioNormalizado}@maker.gamestudando.app`;
}

function obterGoogleSignin() {
  // Evita quebrar o app caso a biblioteca do Google nao esteja carregada.
  try {
    return require("@react-native-google-signin/google-signin").GoogleSignin;
  } catch (_error) {
    return null;
  }
}
