import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "perfilAluno";

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

    nome: "Aluno",
    email: null,

    progresso: {
      faseLiberada: 1
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

// =========================
// 🔄 RESET CORRIGIDO
// =========================
export async function resetarPerfil() {
  try {
    await AsyncStorage.removeItem("perfilAluno");

    // 🔥 ADICIONE ISSO
    await AsyncStorage.removeItem("faseLiberada");

    const perfilInicial = criarPerfilInicial();

    await AsyncStorage.setItem("perfilAluno", JSON.stringify(perfilInicial));

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

  } catch (e) {
    console.error("Erro ao atualizar dados:", e);
  }
}

// =========================
// 🧠 ATUALIZAR MATÉRIA (VOLTOU)
// =========================
export async function atualizarPerfil(materia, acertos, erros) {
  try {
    const perfil = await carregarPerfil();

    const dados = perfil[materia];

    if (!dados) return;

    dados.acertos += acertos;
    dados.erros += erros;

    const totalFase = acertos + erros;

    if (totalFase > 0) {
      dados.ultimaPontuacao = acertos / totalFase;
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

    await salvarPerfil(perfil);

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

    return perfil;
  } catch (e) {
    console.error("Erro ao atualizar configuracoes:", e);
  }
}
