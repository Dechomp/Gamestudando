import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "./firebase";
import { parecemRimar } from "./rimas";

const CACHE_PREFIXO = "questoes_cache_";
const PALAVRAS_MAKER_FALLBACK = [
  "ARDUINO", "BATERIA", "CIRCUITO", "CODIGO", "ENGRENAGEM", "FIO",
  "JUMPER", "LED", "MOTOR", "PLACA", "PROJETO", "RESISTOR", "ROBO", "SENSOR"
];

export async function carregarQuestoesMultiplaEscolha(
  materia,
  perguntasFallback = []
) {
  // Busca perguntas aprovadas no Firestore e usa cache/local se estiver offline.
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
  // Busca pares de rimas aprovados e separa em duas colunas para o quiz.
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

  const cacheValido = filtrarColunasRimasValidas(cache);

  if (cacheValido?.esquerda?.length && cacheValido?.direita?.length) {
    return cacheValido;
  }

  return {
    esquerda: esquerdaFallback,
    direita: direitaFallback
  };
}

export async function carregarPalavraCosmoletrando(palavraFallback = "GATO", palavraAtual = "", tema = "normal") {
  // Cada modo usa cache e banco próprios: Maker nunca mistura palavras comuns.
  const temaSelecionado = tema === "maker" ? "maker" : "normal";
  const cacheKey = `${CACHE_PREFIXO}cosmoletrando_palavra_${temaSelecionado}`;
  const cache = await carregarCache(cacheKey);
  const atual = normalizarPalavraMissao(palavraAtual);
  const fallback = temaSelecionado === "maker"
    ? escolherPalavra(PALAVRAS_MAKER_FALLBACK, atual)
    : normalizarPalavraMissao(palavraFallback) || "GATO";

  try {
    const snaps = await Promise.all([
      getDocs(query(
        collection(db, "questoes"),
        where("materia", "==", "cosmoletrando"),
        where("formato", "==", "palavra"),
        where("ativa", "==", true),
        where("statusRevisao", "==", "aprovada")
      )),
      getDocs(query(
        collection(db, "questoes"),
        where("materia", "==", "rimas"),
        where("formato", "==", "conectar_pares"),
        where("ativa", "==", true),
        where("statusRevisao", "==", "aprovada")
      ))
    ]);

    const palavras = snaps
      .flatMap((snap, indice) => snap.docs.map(docSnap => ({ dados: docSnap.data(), origemRimas: indice === 1 })))
      // Palavras antigas, sem tema salvo, continuam no modo Normal para manter
      // compatibilidade com as atividades que já foram publicadas.
      .filter(({ dados, origemRimas }) => pertenceAoTemaCosmoletrando(dados, temaSelecionado, origemRimas))
      .flatMap(({ dados }) => extrairPalavrasCosmoletrando(dados))
      .map(normalizarPalavraMissao)
      .filter(palavra => palavra.length >= 2 && palavra.length <= 10);

    if (palavras.length) {
      const escolhida = escolherPalavra(palavras, atual);
      await salvarCache(cacheKey, escolhida);
      return escolhida;
    }
  } catch (error) {
    console.log("Erro buscando palavra do Cosmoletrando:", error);
  }

  const cacheValido = normalizarPalavraMissao(cache);
  return temaSelecionado === "maker" && !PALAVRAS_MAKER_FALLBACK.includes(cacheValido)
    ? fallback
    : cacheValido || fallback;
}

export async function sincronizarPerguntasIniciais() {
  // Carrega perguntas em segundo plano depois do login.
  await Promise.allSettled([
    carregarQuestoesMultiplaEscolha("matematica"),
    carregarQuestoesMultiplaEscolha("portugues"),
    carregarQuestoesMultiplaEscolha("maker"),
    carregarQuestoesRimas()
  ]);
}

async function carregarCache(cacheKey) {
  // O cache reduz atraso quando o aluno troca de tela ou fica sem internet.
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
  // Deixa a pergunta do professor no mesmo formato das perguntas locais.
  if (!dados?.pergunta || !Array.isArray(dados?.respostas)) return null;

  return {
    id,
    pergunta: normalizarTextoQuestao(dados.pergunta),
    respostas: dados.respostas.map(normalizarTextoQuestao),
    correta: dados.correta,
    nivel: dados.nivel || 1,
    tipoQuestao: dados.tipoQuestao || dados.materia
  };
}

function normalizarTextoQuestao(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase();
}

function normalizarParRima(id, dados) {
  // Confere se o par realmente rima antes de aparecer para o aluno.
  if (!dados?.esquerda?.texto || !dados?.direita?.texto) return null;
  if (!parecemRimar(dados.esquerda.texto, dados.direita.texto)) return null;

  return {
    id,
    par: dados.par || id,
    grupo: dados.grupo || dados.par || id,
    nivel: dados.nivel || 1,
    esquerda: dados.esquerda,
    direita: dados.direita
  };
}

function extrairPalavrasCosmoletrando(dados) {
  // O jogo pode usar palavras criadas para Cosmoletrando ou vindas das rimas.
  return [
    dados?.palavra,
    dados?.palavraMissao,
    dados?.cosmoletrando?.palavra,
    dados?.esquerda?.texto,
    dados?.direita?.texto
  ].filter(Boolean);
}

function pertenceAoTemaCosmoletrando(dados, tema, origemRimas) {
  // Rimas sempre pertencem ao banco normal; o Maker só lê itens explicitamente marcados.
  if (origemRimas) return tema === "normal";
  const temaDaPalavra = dados?.cosmoletrando?.tema || dados?.temaCosmoletrando || "normal";
  return temaDaPalavra === tema;
}

function escolherPalavra(palavras, palavraAtual) {
  // Evita repetir a palavra recém-jogada quando houver outra opção disponível.
  const candidatas = palavras.filter(palavra => palavra !== palavraAtual);
  const baseSorteio = candidatas.length ? candidatas : palavras;
  return baseSorteio[Math.floor(Math.random() * baseSorteio.length)];
}

function normalizarPalavraMissao(valor) {
  // Remove caracteres que nao devem virar letras no jogo.
  return String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z]/g, "");
}

function converterParesParaColunas(pares) {
  // Transforma os pares do Firebase no formato usado pela tela de rimas.
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

function filtrarColunasRimasValidas(colunas) {
  // Remove dados antigos ou quebrados que possam ter ficado no cache.
  if (!colunas?.esquerda?.length || !colunas?.direita?.length) return null;

  const esquerda = colunas.esquerda.filter(item =>
    colunas.direita.some(direita =>
      direita.grupo === item.grupo && parecemRimar(item.texto, direita.texto)
    )
  );

  const direita = colunas.direita.filter(item =>
    esquerda.some(esquerdaItem =>
      esquerdaItem.grupo === item.grupo && parecemRimar(esquerdaItem.texto, item.texto)
    )
  );

  return { esquerda, direita };
}
