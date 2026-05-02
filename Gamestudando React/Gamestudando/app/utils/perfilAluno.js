import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "perfilAluno";

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
      erros: 0
    },

    portugues: {
      nivel: 3,
      acertos: 0,
      erros: 0
    },

    rimas: {
      nivel: 3,
      acertos: 0,
      erros: 0
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
      return JSON.parse(json);
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
    const perfilInicial = {
      uid: null,

      nome: "Aluno",
      email: null,

      progresso: {
        faseLiberada: 1
      },

      matematica: {
        nivel: 3,
        acertos: 0,
        erros: 0
      },

      portugues: {
        nivel: 3,
        acertos: 0,
        erros: 0
      },

      rimas: {
        nivel: 3,
        acertos: 0,
        erros: 0
      }
    };

    // 🔥 USA A MESMA KEY DO SISTEMA
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