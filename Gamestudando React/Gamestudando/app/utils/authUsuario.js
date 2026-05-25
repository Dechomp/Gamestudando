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

export function observarUsuarioLogado(callback) {
  return onAuthStateChanged(auth, callback);
}

export function obterUsuarioLogado() {
  return auth.currentUser;
}

export function obterRotaInicialPorPerfil(perfil) {
  if (!perfil) return "/tipoContaGoogle";
  if (perfil?.tipo === "professor") return "/PerfilProfessor";
  if (perfil?.tipo === "responsavel") return "/PerfilResponsavel";
  if (!perfil?.progresso?.avaliacaoInicialConcluida) {
    return "/avaliacaoInicial";
  }

  return "/";
}

export async function cadastrarAlunoEmail({ nome, email, senha, tipo = "aluno" }) {
  const credencial = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    senha
  );

  const usuario = credencial.user;

  await updateProfile(usuario, {
    displayName: nome.trim()
  });

  await sendEmailVerification(usuario);

  const perfilAtual = await carregarPerfil();
  const perfilAluno = {
    ...perfilAtual,
    uid: usuario.uid,
    tipo,
    nome: nome.trim(),
    email: usuario.email,
    progresso: {
      ...(perfilAtual.progresso || {}),
      avaliacaoInicialConcluida: tipo === "aluno" ? false : true,
      avaliacaoInicialConcluidaEm: null
    }
  };

  await salvarPerfil(perfilAluno);
  await criarOuAtualizarAlunoFirebase(usuario.uid, perfilAluno, {
    merge: false
  });
  sincronizarPerguntasIniciais().catch(() => {});

  return {
    usuario,
    perfil: perfilAluno
  };
}

export async function carregarPerfilUsuarioAtual({ criarSeNaoExistir = true } = {}) {
  const usuario = auth.currentUser;

  if (!usuario) return null;

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
  const credencial = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    senha
  );

  const usuario = credencial.user;
  const perfilLocal = await carregarPerfilUsuarioAtual();
  sincronizarPerguntasIniciais().catch(() => {});

  return {
    usuario,
    perfil: perfilLocal
  };
}

export async function entrarComCredencialGoogle(idToken) {
  const credencialGoogle = GoogleAuthProvider.credential(idToken);
  const credencial = await signInWithCredential(auth, credencialGoogle);
  const perfilLocal = await carregarPerfilUsuarioAtual({
    criarSeNaoExistir: false
  });
  sincronizarPerguntasIniciais().catch(() => {});

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
  await signOut(auth);
  await limparPerfilLocal();
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
  const perfilAtual = await carregarPerfil();
  const perfilAluno = {
    ...perfilAtual,
    uid: usuario.uid,
    tipo,
    nome: usuario.displayName || "Aluno",
    email: usuario.email || null,
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
  return {
    uid: perfilFirebase.uid,
    tipo: perfilFirebase.tipo || "aluno",
    nome: perfilFirebase.nome || "Aluno",
    email: perfilFirebase.email || null,
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
    estatisticas: perfilFirebase.estatisticas || {}
  };
}
