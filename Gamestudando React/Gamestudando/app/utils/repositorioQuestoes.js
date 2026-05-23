import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "./firebase";

const CACHE_PREFIXO = "questoes_cache_";

export async function carregarQuestoesMultiplaEscolha(
  materia,
  perguntasFallback = []
) {
  const cacheKey = `${CACHE_PREFIXO}${materia}_multipla_escolha`;

  const perguntasCache = await carregarCache(cacheKey);

  try {
    const consulta = query(
      collection(db, "questoes"),
      where("materia", "==", materia),
      where("formato", "==", "multipla_escolha"),
      where("ativa", "==", true),
      where("statusRevisao", "==", "aprovada")
    );

    const snap = await getDocs(consulta);
    const perguntas = snap.docs
      .map(docSnap => normalizarMultiplaEscolha(docSnap.id, docSnap.data()))
      .filter(Boolean);

    if (perguntas.length) {
      await salvarCache(cacheKey, perguntas);
      return perguntas;
    }
  } catch (error) {
    console.log(`Erro buscando perguntas de ${materia}:`, error);
  }

  return perguntasCache.length ? perguntasCache : perguntasFallback;
}

export async function carregarQuestoesRimas(
  esquerdaFallback = [],
  direitaFallback = []
) {
  const cacheKey = `${CACHE_PREFIXO}rimas_conectar_pares`;
  const cache = await carregarCache(cacheKey);

  try {
    const consulta = query(
      collection(db, "questoes"),
      where("materia", "==", "rimas"),
      where("formato", "==", "conectar_pares"),
      where("ativa", "==", true),
      where("statusRevisao", "==", "aprovada")
    );

    const snap = await getDocs(consulta);
    const pares = snap.docs
      .map(docSnap => normalizarParRima(docSnap.id, docSnap.data()))
      .filter(Boolean);

    if (pares.length) {
      const normalizado = converterParesParaColunas(pares);
      await salvarCache(cacheKey, normalizado);
      return normalizado;
    }
  } catch (error) {
    console.log("Erro buscando perguntas de rimas:", error);
  }

  if (cache?.esquerda?.length && cache?.direita?.length) {
    return cache;
  }

  return {
    esquerda: esquerdaFallback,
    direita: direitaFallback
  };
}

export async function sincronizarPerguntasIniciais() {
  await Promise.allSettled([
    carregarQuestoesMultiplaEscolha("matematica"),
    carregarQuestoesMultiplaEscolha("portugues"),
    carregarQuestoesRimas()
  ]);
}

async function carregarCache(cacheKey) {
  try {
    const json = await AsyncStorage.getItem(cacheKey);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.log("Erro carregando cache de perguntas:", error);
    return [];
  }
}

async function salvarCache(cacheKey, valor) {
  try {
    await AsyncStorage.setItem(cacheKey, JSON.stringify(valor));
  } catch (error) {
    console.log("Erro salvando cache de perguntas:", error);
  }
}

function normalizarMultiplaEscolha(id, dados) {
  if (!dados?.pergunta || !Array.isArray(dados?.respostas)) return null;

  return {
    id,
    pergunta: dados.pergunta,
    respostas: dados.respostas,
    correta: dados.correta,
    nivel: dados.nivel || 1,
    tipoQuestao: dados.tipoQuestao || dados.materia
  };
}

function normalizarParRima(id, dados) {
  if (!dados?.esquerda?.texto || !dados?.direita?.texto) return null;

  return {
    id,
    par: dados.par || id,
    grupo: dados.grupo || dados.par || id,
    nivel: dados.nivel || 1,
    esquerda: dados.esquerda,
    direita: dados.direita
  };
}

function converterParesParaColunas(pares) {
  return {
    esquerda: pares.map(par => ({
      id: `E_${par.id}`,
      texto: par.esquerda.texto,
      grupo: par.grupo,
      par: par.par,
      nivel: par.esquerda.nivel || par.nivel
    })),
    direita: pares.map(par => ({
      id: `D_${par.id}`,
      texto: par.direita.texto,
      grupo: par.grupo,
      par: par.par,
      nivel: par.direita.nivel || par.nivel
    }))
  };
}
