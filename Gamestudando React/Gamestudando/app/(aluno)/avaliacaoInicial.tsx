import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useRouter } from "expo-router";

import { perguntasMatematica } from "../perguntasMatematicaQuiz4";
import { perguntasPortugues } from "../perguntasPortuguesQuiz4";
import { palavrasDireita, palavrasEsquerda } from "../perguntasQuizRimas";
import {
  carregarPerfil,
  concluirAvaliacaoInicial
} from "../utils/perfilAluno";
import { lerTextoSeAtivo, pararLeitura } from "../utils/leituraPerguntas";
import {
  carregarQuestoesMultiplaEscolha,
  carregarQuestoesRimas
} from "../utils/repositorioQuestoes";
import { styles } from "../styles";

const NIVEIS_MATEMATICA = [1, 1, 2, 2, 3, 3, 4];
const NIVEIS_PORTUGUES = [1, 2, 3, 4, 4, 5, 6];
const NIVEIS_RIMAS = [1, 1, 2, 3, 4];

export default function AvaliacaoInicial() {
  const router = useRouter();
  const [questoes, setQuestoes] = useState([]);
  const [paresRimas, setParesRimas] = useState([]);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState([]);
  const [selecionada, setSelecionada] = useState(null);
  const [rimaEsquerda, setRimaEsquerda] = useState(null);
  const [paresSelecionados, setParesSelecionados] = useState([]);
  const [finalizando, setFinalizando] = useState(false);
  const [verificandoAvaliacao, setVerificandoAvaliacao] = useState(true);

  const etapaRimas = indice >= questoes.length;
  const questaoAtual = questoes[indice];

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      pararLeitura();

      const perfil = await carregarPerfil();

      if (!ativo) return;

      if (perfil?.progresso?.avaliacaoInicialConcluida) {
        router.replace("/");
        return;
      }

      setVerificandoAvaliacao(false);

      const [portugues, matematica, rimas] = await Promise.all([
        carregarQuestoesMultiplaEscolha("portugues", perguntasPortugues),
        carregarQuestoesMultiplaEscolha("matematica", perguntasMatematica),
        carregarQuestoesRimas(palavrasEsquerda, palavrasDireita)
      ]);

      if (!ativo) return;

      setQuestoes(montarQuestoesAvaliacao(portugues, matematica));
      setParesRimas(montarParesRimas(rimas.esquerda, rimas.direita));
    };

    carregar();

    return () => {
      ativo = false;
      pararLeitura();
    };
  }, [router]);

  useEffect(() => {
    if (!questaoAtual || etapaRimas) return;

    lerTextoSeAtivo(questaoAtual.pergunta);

    return () => {
      pararLeitura();
    };
  }, [etapaRimas, questaoAtual]);

  function responderQuestao() {
    if (selecionada === null) {
      Alert.alert("Avaliacao", "Escolha uma resposta.");
      return;
    }

    setRespostas(prev => [
      ...prev,
      {
        materia: questaoAtual.materia,
        correta: selecionada === questaoAtual.correta
      }
    ]);

    setSelecionada(null);
    setIndice(prev => prev + 1);
  }

  function selecionarRimaEsquerda(item) {
    setRimaEsquerda(item);
    lerTextoSeAtivo(item.texto);
  }

  function selecionarRimaDireita(item) {
    if (!rimaEsquerda) {
      lerTextoSeAtivo(item.texto);
      return;
    }

    const jaUsouEsquerda = paresSelecionados.some(
      par => par.esquerda.id === rimaEsquerda.id
    );

    const jaUsouDireita = paresSelecionados.some(
      par => par.direita.id === item.id
    );

    if (jaUsouEsquerda || jaUsouDireita) {
      setRimaEsquerda(null);
      return;
    }

    setParesSelecionados(prev => [
      ...prev,
      {
        esquerda: rimaEsquerda,
        direita: item,
        correta: rimaEsquerda.par === item.par
      }
    ]);

    setRimaEsquerda(null);
    lerTextoSeAtivo(item.texto);
  }

  async function finalizarAvaliacao() {
    if (paresSelecionados.length < paresRimas.length) {
      Alert.alert("Rimas", "Complete os 5 pares de rimas.");
      return;
    }

    const resultado = calcularResultado(respostas, paresSelecionados);

    try {
      setFinalizando(true);
      await concluirAvaliacaoInicial(resultado);
      router.replace("/");
    } catch (error) {
      console.log("Erro finalizando avaliacao:", error);
      Alert.alert("Avaliacao", "Nao foi possivel finalizar agora.");
    } finally {
      setFinalizando(false);
    }
  }

  if (verificandoAvaliacao || !questoes.length || !paresRimas.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando avaliacao...</Text>
      </View>
    );
  }

  if (etapaRimas) {
    return (
      <ScrollView contentContainerStyle={styles.avaliacaoContainer}>
        <Text style={styles.avaliacaoTitulo}>Rimas</Text>

        <Text style={styles.avaliacaoProgresso}>
          Parte final: forme 5 pares
        </Text>

        <View style={styles.rimasColunas}>
          <View style={styles.rimasColuna}>
            {paresRimas.map(({ esquerda }) => {
              const usada = paresSelecionados.some(
                par => par.esquerda.id === esquerda.id
              );

              return (
                <TouchableOpacity
                  key={esquerda.id}
                  disabled={usada}
                  style={[
                    styles.itemNormal,
                    rimaEsquerda?.id === esquerda.id && styles.itemSelecionado,
                    usada && styles.itemDesativado
                  ]}
                  onPress={() => selecionarRimaEsquerda(esquerda)}
                >
                  <Text style={styles.texto}>{esquerda.texto}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.rimasColuna}>
            {paresRimas.map(({ direita }) => {
              const usada = paresSelecionados.some(
                par => par.direita.id === direita.id
              );

              return (
                <TouchableOpacity
                  key={direita.id}
                  disabled={usada}
                  style={[
                    styles.itemNormal,
                    usada && styles.itemDesativado
                  ]}
                  onPress={() => selecionarRimaDireita(direita)}
                >
                  <Text style={styles.texto}>{direita.texto}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.botaoConfirmarBase,
            styles.botaoFinalizar,
            finalizando && styles.botaoDesabilitado
          ]}
          disabled={finalizando}
          onPress={finalizarAvaliacao}
        >
          <Text style={styles.textoBotao}>
            {finalizando ? "Salvando..." : "Finalizar avaliacao"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.avaliacaoContainer}>
      <Text style={styles.avaliacaoTitulo}>Avaliacao inicial</Text>

      <Text style={styles.avaliacaoProgresso}>
        Pergunta {indice + 1} de {questoes.length}
      </Text>

      <Text style={styles.textoPergunta}>
        {questaoAtual.pergunta}
      </Text>

      <View style={styles.avaliacaoRespostas}>
        {questaoAtual.respostas.map((resposta, respostaIndex) => (
          <TouchableOpacity
            key={`${questaoAtual.id}-${respostaIndex}`}
            style={[
              styles.avaliacaoBotaoResposta,
              selecionada === respostaIndex &&
                styles.avaliacaoBotaoSelecionado
            ]}
            onPress={() => {
              setSelecionada(respostaIndex);
              lerTextoSeAtivo(String(resposta));
            }}
          >
            <Text style={styles.textoBotao}>{resposta}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.botaoConfirmarBase,
          selecionada === null
            ? styles.botaoConfirmarVazio
            : styles.botaoConfirmarSelecionado
        ]}
        onPress={responderQuestao}
      >
        <Text style={styles.textoBotao}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function montarQuestoesAvaliacao(portugues, matematica) {
  return [
    ...selecionarPorNiveis(portugues, NIVEIS_PORTUGUES, "portugues"),
    ...selecionarPorNiveis(
      matematica,
      NIVEIS_MATEMATICA,
      "matematica"
    )
  ].sort(() => Math.random() - 0.5);
}

function selecionarPorNiveis(lista, niveis, materia) {
  const usados = new Set();

  return niveis.map((nivel, index) => {
    const disponiveis = lista.filter((pergunta, perguntaIndex) => (
      pergunta.nivel === nivel && !usados.has(perguntaIndex)
    ));

    const escolhida = disponiveis[
      Math.floor(Math.random() * disponiveis.length)
    ] || lista.find(pergunta => pergunta.nivel === nivel) || lista[0];

    const indiceOriginal = lista.indexOf(escolhida);
    usados.add(indiceOriginal);

    return {
      ...escolhida,
      id: `${materia}-${nivel}-${index}`,
      materia
    };
  });
}

function montarParesRimas(esquerdaBase, direitaBase) {
  const paresUsados = new Set();
  const pares = NIVEIS_RIMAS.map((nivel) => {
    const esquerda = esquerdaBase.find(item => (
      item.nivel === nivel && !paresUsados.has(item.par)
    )) || esquerdaBase.find(item => item.nivel === nivel);

    const direita =
      direitaBase.find(item => item.par === esquerda.par) ||
      direitaBase[0];

    paresUsados.add(esquerda.par);

    return { esquerda, direita };
  });

  const direitas = pares
    .map(par => par.direita)
    .sort(() => Math.random() - 0.5);

  return pares
    .map((par, index) => ({
      esquerda: par.esquerda,
      direita: direitas[index]
    }))
    .sort(() => Math.random() - 0.5);
}

function calcularResultado(respostas, paresSelecionados) {
  const resultado = {
    portugues: { acertos: 0, erros: 0 },
    matematica: { acertos: 0, erros: 0 },
    rimas: { acertos: 0, erros: 0 }
  };

  respostas.forEach(resposta => {
    if (resposta.correta) {
      resultado[resposta.materia].acertos += 1;
    } else {
      resultado[resposta.materia].erros += 1;
    }
  });

  paresSelecionados.forEach(par => {
    if (par.correta) {
      resultado.rimas.acertos += 1;
    } else {
      resultado.rimas.erros += 1;
    }
  });

  return resultado;
}
