import AsyncStorage from "@react-native-async-storage/async-storage";
import { criarOuAtualizarAlunoFirebase } from "./firebasePerfil";
import { auth } from "./firebase";

const KEY = "perfilAluno";
const ALUNO_TESTE_UID = "aluno-teste-local";

const NIVEL_MAXIMO = {
  matematica: 4,
  portugues: 6,
  rimas: 4
};

// =========================
// 🆕 PERFIL PADRÃO
// =========================
function criarPerfilInicial() {
  return {
    uid: null,

    tipo: "aluno",
    nome: "Aluno",
    email: null,

    progresso: {
      faseLiberada: 1,
      maiorFaseConcluida: 0,
      avaliacaoInicialConcluida: false,
      avaliacaoInicialConcluidaEm: null,
      materiasPorFase: {}
    },

    matematica: {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },

    portugues: {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },

    rimas: {
      nivel: 3,
      acertos: 0,
      erros: 0,
      ultimaPontuacao: 0.5
    },

    configuracoes: {
      leituraPerguntasAtiva: true
    }
  };
}

function completarPerfil(perfil) {
  const inicial = criarPerfilInicial();

  return {
    ...inicial,
    ...perfil,
    progresso: {
      ...inicial.progresso,
      ...(perfil?.progresso || {})
    },
    matematica: {
      ...inicial.matematica,
      ...(perfil?.matematica || {})
    },
    portugues: {
      ...inicial.portugues,
      ...(perfil?.portugues || {})
    },
    rimas: {
      ...inicial.rimas,
      ...(perfil?.rimas || {})
    },
    configuracoes: {
      ...inicial.configuracoes,
      ...(perfil?.configuracoes || {})
    }
  };
}

// =========================
// 📥 CARREGAR PERFIL
// =========================
export async function carregarPerfil() {
  try {
    const json = await AsyncStorage.getItem(KEY);

    if (json) {
      return completarPerfil(JSON.parse(json));
    }

    const perfilInicial = criarPerfilInicial();
    await salvarPerfil(perfilInicial);

    return perfilInicial;

  } catch (e) {
    console.error("Erro ao carregar perfil:", e);
    return criarPerfilInicial();
  }
}

// =========================
// 💾 SALVAR
// =========================
export async function salvarPerfil(perfil) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(perfil));
  } catch (e) {
    console.error("Erro ao salvar perfil:", e);
  }
}

export async function limparPerfilLocal() {
  try {
    await AsyncStorage.removeItem(KEY);
    await AsyncStorage.removeItem("faseLiberada");
  } catch (e) {
    console.error("Erro ao limpar perfil local:", e);
  }
}

function obterUidAluno() {
  return auth.currentUser?.uid || ALUNO_TESTE_UID;
}

// =========================
// 🔄 RESET CORRIGIDO
// =========================
export async function resetarPerfil() {
  try {
    await AsyncStorage.removeItem("perfilAluno");

    // 🔥 ADICIONE ISSO
    await AsyncStorage.removeItem("faseLiberada");

    const perfilInicial = criarPerfilInicial();
    const uidAtual = obterUidAluno();

    perfilInicial.uid = uidAtual === ALUNO_TESTE_UID ? null : uidAtual;
    perfilInicial.nome = auth.currentUser?.displayName || "Aluno";
    perfilInicial.email = auth.currentUser?.email || null;

    await AsyncStorage.setItem("perfilAluno", JSON.stringify(perfilInicial));

    try {
      await criarOuAtualizarAlunoFirebase(
        uidAtual,
        perfilInicial,
        { merge: false }
      );
    } catch (e) {
      console.error("Erro ao resetar perfil no Firebase:", e);
    }

    return perfilInicial;

  } catch (e) {
    console.error("Erro ao resetar perfil:", e);
  }
}

// =========================
// ✏️ ATUALIZAR DADOS
// =========================
export async function atualizarDadosBasicos({ nome, email }) {
  try {
    const perfil = await carregarPerfil();

    if (nome !== undefined) perfil.nome = nome;
    if (email !== undefined) perfil.email = email;

    await salvarPerfil(perfil);

    try {
      await criarOuAtualizarAlunoFirebase(obterUidAluno(), perfil);
    } catch (e) {
      console.error("Erro ao atualizar dados no Firebase:", e);
    }

    return perfil;

  } catch (e) {
    console.error("Erro ao atualizar dados:", e);
  }
}

// =========================
// 🧠 ATUALIZAR MATÉRIA (VOLTOU)
// =========================
export async function atualizarPerfil(materia, acertos, erros, faseConcluida) {
  try {
    const perfil = await carregarPerfil();

    const dados = perfil[materia];

    if (!dados) return;

    dados.acertos += acertos;
    dados.erros += erros;

    const totalFase = acertos + erros;

    if (totalFase > 0) {
      dados.ultimaPontuacao = acertos / totalFase;
      dados.atividadesConcluidas =
        (dados.atividadesConcluidas || 0) + 1;
    }

    const total = dados.acertos + dados.erros;
    const taxa = total > 0 ? dados.acertos / total : 0;

    if (taxa > 0.8) {
      dados.nivel += 1;
    } else if (taxa < 0.4 && dados.nivel > 1) {
      dados.nivel -= 1;
    }

    const maximo = NIVEL_MAXIMO[materia] || 6;
    dados.nivel = Math.max(1, Math.min(dados.nivel, maximo));

    if (faseConcluida !== undefined && faseConcluida !== null) {
      const fase = parseInt(String(faseConcluida));

      if (!isNaN(fase)) {
        const proximaFase = fase + 1;

        perfil.progresso = {
          ...(perfil.progresso || {}),
          faseLiberada: Math.max(
            perfil.progresso?.faseLiberada || 1,
            proximaFase
          ),
          maiorFaseConcluida: Math.max(
            perfil.progresso?.maiorFaseConcluida || 0,
            fase
          )
        };

        await AsyncStorage.setItem(
          "faseLiberada",
          String(perfil.progresso.faseLiberada)
        );
      }
    }

    await salvarPerfil(perfil);

    try {
      await criarOuAtualizarAlunoFirebase(obterUidAluno(), perfil);
    } catch (e) {
      console.error("Erro ao sincronizar perfil no Firebase:", e);
    }

    return perfil;

  } catch (e) {
    console.error("Erro ao atualizar perfil:", e);
  }
}

export async function atualizarConfiguracoes(novasConfiguracoes) {
  try {
    const perfil = await carregarPerfil();

    perfil.configuracoes = {
      ...(perfil.configuracoes || {}),
      ...novasConfiguracoes
    };

    await salvarPerfil(perfil);

    try {
      await criarOuAtualizarAlunoFirebase(obterUidAluno(), perfil);
    } catch (e) {
      console.error("Erro ao atualizar configuracoes no Firebase:", e);
    }

    return perfil;
  } catch (e) {
    console.error("Erro ao atualizar configuracoes:", e);
  }
}

export async function obterOuCriarMateriaDaFase(faseId, materiaSugerida) {
  const fase = String(faseId);
  const perfil = await carregarPerfil();
  const progresso = perfil.progresso || {};
  const materiasPorFase = progresso.materiasPorFase || {};

  if (materiasPorFase[fase]) {
    return materiasPorFase[fase];
  }

  const materia = materiaSugerida || escolherMateriaPadrao(Number(faseId));

  perfil.progresso = {
    ...progresso,
    materiasPorFase: {
      ...materiasPorFase,
      [fase]: materia
    }
  };

  await salvarPerfil(perfil);

  criarOuAtualizarAlunoFirebase(obterUidAluno(), perfil).catch((e) => {
    console.error("Erro ao salvar materia da fase no Firebase:", e);
  });

  return materia;
}

export async function concluirAvaliacaoInicial(resultado) {
  try {
    const perfil = await carregarPerfil();
    const matematica = resultado?.matematica || {};
    const portugues = resultado?.portugues || {};
    const rimas = resultado?.rimas || {};

    perfil.matematica = montarMateriaAvaliada(
      perfil.matematica,
      matematica,
      NIVEL_MAXIMO.matematica
    );

    perfil.portugues = montarMateriaAvaliada(
      perfil.portugues,
      portugues,
      NIVEL_MAXIMO.portugues
    );

    perfil.rimas = montarMateriaAvaliada(
      perfil.rimas,
      rimas,
      NIVEL_MAXIMO.rimas
    );

    perfil.progresso = {
      ...(perfil.progresso || {}),
      avaliacaoInicialConcluida: true,
      avaliacaoInicialConcluidaEm: new Date().toISOString()
    };

    perfil.estatisticas = {
      ...(perfil.estatisticas || {}),
      precisaRevisao: montarRevisoesAvaliacao(resultado),
      materiaMaisFraca: calcularMateriaMaisFracaAvaliacao(resultado)
    };

    await salvarPerfil(perfil);

    try {
      await criarOuAtualizarAlunoFirebase(obterUidAluno(), perfil);
    } catch (e) {
      console.error("Erro ao salvar avaliacao inicial no Firebase:", e);
    }

    return perfil;
  } catch (e) {
    console.error("Erro ao concluir avaliacao inicial:", e);
  }
}

function escolherMateriaPadrao(faseId) {
  if (faseId % 3 === 0) return "rimas";
  if (faseId % 2 === 0) return "matematica";
  return "portugues";
}

function montarMateriaAvaliada(materiaAtual, resultadoMateria, nivelMaximo) {
  const acertos = resultadoMateria.acertos || 0;
  const erros = resultadoMateria.erros || 0;
  const total = acertos + erros;

  return {
    ...(materiaAtual || {}),
    nivel: calcularNivelInicial(acertos, total, nivelMaximo),
    acertos,
    erros,
    ultimaPontuacao: total > 0 ? acertos / total : 0.5,
    atividadesConcluidas:
      (materiaAtual?.atividadesConcluidas || 0) + 1
  };
}

function calcularNivelInicial(acertos, total, nivelMaximo) {
  if (total <= 0) return 1;

  const taxa = acertos / total;

  if (taxa >= 0.85) return nivelMaximo;
  if (taxa >= 0.65) return Math.max(1, nivelMaximo - 1);
  if (taxa >= 0.4) return Math.max(1, Math.ceil(nivelMaximo / 2));

  return 1;
}

function montarRevisoesAvaliacao(resultado) {
  return Object.entries(resultado || {})
    .filter(([, dados]) => {
      const total = (dados?.acertos || 0) + (dados?.erros || 0);
      return total > 0 && (dados?.acertos || 0) / total < 0.6;
    })
    .map(([materia]) => materia);
}

function calcularMateriaMaisFracaAvaliacao(resultado) {
  let materiaMaisFraca = null;
  let menorTaxa = Infinity;

  Object.entries(resultado || {}).forEach(([materia, dados]) => {
    const total = (dados?.acertos || 0) + (dados?.erros || 0);
    const taxa = total > 0 ? (dados?.acertos || 0) / total : 0.5;

    if (taxa < menorTaxa) {
      menorTaxa = taxa;
      materiaMaisFraca = materia;
    }
  });

  return materiaMaisFraca;
}
