import { Text, View, TouchableOpacity, Animated, ScrollView } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { styles } from "../styles";
import { perguntasPortugues } from "../perguntasPortuguesQuiz4";
import { atualizarPerfil, carregarPerfil } from "../utils/perfilAluno";
import { lerTextoSeAtivo, pararLeitura } from "../utils/leituraPerguntas";
import { carregarQuestoesMultiplaEscolha } from "../utils/repositorioQuestoes";

// Funcao para embaralhar perguntas e respostas.
function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

// Troca a ordem das respostas sem perder qual e a correta.
function embaralharPergunta(pergunta) {
  const respostasComIndice = pergunta.respostas.map((resposta, indice) => ({
    resposta,
    indiceOriginal: indice
  }));

  const respostasEmbaralhadas = embaralhar(respostasComIndice);

  const novaCorreta = respostasEmbaralhadas.findIndex(
    item => item.indiceOriginal === pergunta.correta
  );

  return {
    ...pergunta,
    respostas: respostasEmbaralhadas.map(item => item.resposta),
    correta: novaCorreta
  };
}
function selecionarPerguntasIA(lista, nivelAluno = 3, quantidade = 5) {
  // Escolhe perguntas proximas ao nivel atual do aluno.
  const niveis = lista.map(p => p.nivel);
  const menorNivel = Math.min(...niveis);
  const maiorNivel = Math.max(...niveis);

  const nivelSeguro = Math.max(
    menorNivel,
    Math.min(nivelAluno, maiorNivel)
  );

  const base = lista.filter(p => p.nivel === nivelSeguro);
  const acima = lista.filter(p => p.nivel === nivelSeguro + 1);
  const acima2 = lista.filter(p => p.nivel === nivelSeguro + 2);

  const perguntas = embaralhar([
    ...embaralhar(base).slice(0, 2),
    ...embaralhar(acima).slice(0, 2),
    ...embaralhar(acima2).slice(0, 1),
  ]);

  const perguntasUsadas = new Set(perguntas);

  if (perguntas.length < quantidade) {
    const extras = embaralhar(lista).filter(
      pergunta => !perguntasUsadas.has(pergunta)
    );

    perguntas.push(...extras.slice(0, quantidade - perguntas.length));
  }

  return perguntas
    .slice(0, quantidade)
    .map(embaralharPergunta);
}
export default function Index() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const finalizandoRef = useRef(false);

  const [perguntasSorteadas, setPerguntasSorteadas] = useState([]);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostaConfirmada, setRespostaConfirmada] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState(0);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);

  const perguntaAtualObj = perguntasSorteadas[perguntaAtual];
  const ultimaPergunta = perguntaAtual === perguntasSorteadas.length - 1;
  const progresso = (perguntaAtual + 1) / (perguntasSorteadas.length || 1);

  useEffect(() => {
    if (!perguntaAtualObj) return;

    lerTextoSeAtivo(perguntaAtualObj.pergunta);

    return () => {
      pararLeitura();
    };
  }, [perguntaAtualObj]);

  const faseAtual = Array.isArray(params.faseId)
    ? params.faseId[0]
    : params.faseId || "1";

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregar = async () => {
        // Carrega perguntas do Firebase/cache e monta o quiz.
        const perfil = await carregarPerfil();
        const nivel = perfil?.portugues?.nivel || 3;
        const perguntasBase = await carregarQuestoesMultiplaEscolha(
          "portugues",
          perguntasPortugues
        );
        const perguntas = selecionarPerguntasIA(perguntasBase, nivel, 5);

        if (!ativo) return;

        finalizandoRef.current = false;
        fadeAnim.setValue(1);
        setPerguntasSorteadas(perguntas);
        setRespostaSelecionada(null);
        setRespostaConfirmada(false);
        setPerguntaAtual(0);
        setAcertos(0);
        setErros(0);
      };

      carregar();

      return () => {
        ativo = false;
      };
    }, [fadeAnim])
  );

  const animarClique = (index) => {
    // Pequena animacao para mostrar que o botao foi tocado.
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selecionarResposta = (resposta) => {
    // Permite selecionar e desmarcar uma alternativa.
    if (respostaConfirmada) return;

    setRespostaSelecionada(
      respostaSelecionada === resposta ? null : resposta
    );
  };

  const confirmarResposta = async () => {
    // Primeiro clique confirma, segundo clique avanca.
    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {
      const acertou = respostaSelecionada === perguntaAtualObj.correta;

      if (acertou) {
        setAcertos(prev => prev + 1);
      } else {
        setErros(prev => prev + 1);
      }

      setRespostaConfirmada(true);
      return;
    }

    if (!ultimaPergunta) {
      setRespostaSelecionada(null);
      setRespostaConfirmada(false);
      setPerguntaAtual(prev => prev + 1);
      return;
    }

    if (finalizandoRef.current) return;

    finalizandoRef.current = true;

    const acertouUltima = respostaSelecionada === perguntaAtualObj.correta;
    const totalAcertos = acertos + (acertouUltima ? 0 : 0);
    const totalErros = erros + (acertouUltima ? 0 : 0);

    try {
      await atualizarPerfil("portugues", totalAcertos, totalErros, faseAtual);
    } catch (error) {
      console.log("Erro salvando portugues:", error);
    }

    router.replace({
      pathname: "/Aluno",
      params: { faseConcluida: String(faseAtual) },
    });
  };

  const estiloBotao = (index) => {
    // Depois de confirmar, mostra verde para certa e vermelho para errada.
    if (!respostaConfirmada) {
      return respostaSelecionada === index
        ? styles.botaoRespostaSelecionada
        : styles.botaoResposta;
    }

    if (index === perguntaAtualObj.correta) return styles.botaoRespostaCerta;
    if (index === respostaSelecionada) return styles.botaoRespostaErrada;
    return styles.botaoResposta;
  };

  if (!perguntaAtualObj) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando portugues...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.telaFlex, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.matematicaContainer}>
        <View style={styles.matematicaContent}>
          <View style={styles.barraContainer}>
            <View
              style={[
                styles.barraProgresso,
                { width: `${progresso * 100}%` },
              ]}
            />
          </View>

          <Text style={styles.textoPequeno}>
            {perguntaAtual + 1} / {perguntasSorteadas.length}
          </Text>

          <Text style={styles.textoPergunta}>
            Pergunta {perguntaAtual + 1}: {perguntaAtualObj.pergunta}
          </Text>

          {[0, 2].map(i => (
            <View key={i} style={styles.matematicaRespostasLinha}>
              {[i, i + 1].map(j => (
                <Animated.View
                  key={j}
                  style={[
                    styles.matematicaRespostaWrapper,
                    { transform: [{ scale: scaleAnims[j] }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      estiloBotao(j),
                      styles.botaoRespostaMatematica,
                    ]}
                    onPress={() => {
                      animarClique(j);
                      lerTextoSeAtivo(perguntaAtualObj.respostas[j]);
                      selecionarResposta(j);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.textoBotao}>
                      {perguntaAtualObj.respostas[j]}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            onPress={confirmarResposta}
            style={[
              styles.botaoConfirmarBase,
              styles.botaoConfirmarMatematica,
              respostaSelecionada === null && !respostaConfirmada &&
                styles.botaoConfirmarVazio,
              respostaSelecionada !== null && !respostaConfirmada &&
                styles.botaoConfirmarSelecionado,
              respostaConfirmada &&
                respostaSelecionada === perguntaAtualObj.correta &&
                styles.botaoConfirmarCerto,
              respostaConfirmada &&
                respostaSelecionada !== perguntaAtualObj.correta &&
                styles.botaoConfirmarErrado,
            ]}
          >
            <Text style={styles.textoBotao}>
              {!respostaConfirmada
                ? "Confirmar resposta"
                : ultimaPergunta
                  ? "Finalizar tarefa"
                  : "Proxima pergunta"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.textoRodape}>
            Jesus e o melhor professor de todos os tempos!
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
