import { Text, View, TouchableOpacity, Animated, ScrollView } from "react-native";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { styles } from "../styles";
import { perguntasMatematica } from "../perguntasMatematicaQuiz4";
import { atualizarPerfil, carregarPerfil } from "../utils/perfilAluno";
import { lerTextoSeAtivo, pararLeitura } from "../utils/leituraPerguntas";
import { carregarQuestoesMultiplaEscolha } from "../utils/repositorioQuestoes";


// Funcao para trocar a ordem das respostas e manter a alternativa correta certa.
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

// Funcao para embaralhar uma lista.
function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

// Funcao para escolher perguntas proximas ao nivel do aluno.
function selecionarPerguntasIA(lista, nivelAluno = 3, quantidade = 5) {
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

  const resultado = [];

  resultado.push(...embaralhar(base).slice(0, 2));
  resultado.push(...embaralhar(acima).slice(0, 2));
  resultado.push(...embaralhar(acima2).slice(0, 1));

  const perguntas = embaralhar(resultado);
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

  const fadeAnim = useState(new Animated.Value(1))[0];

  // animação individual
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [nivelAluno, setNivelAluno] = useState(3);
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

  // Carrega perfil e sorteia perguntas sempre que a tela abrir.
  useFocusEffect(
    useCallback(() => {

      let ativo = true;

      setRespostaSelecionada(null);
      setRespostaConfirmada(false);
      setPerguntaAtual(0);
      setAcertos(0);
      setErros(0);
      fadeAnim.setValue(1);

      const carregar = async () => {
        const perfil = await carregarPerfil();
        const nivelAtual = perfil?.matematica?.nivel || nivelAluno;
        setNivelAluno(nivelAtual);

        const perguntasBase = await carregarQuestoesMultiplaEscolha(
          "matematica",
          perguntasMatematica
        );
        const perguntas = selecionarPerguntasIA(
          perguntasBase,
          nivelAtual,
          5
        );

        if (!ativo) return;

        setPerguntasSorteadas(perguntas);
      };

      carregar();

      return () => {
        ativo = false;
      };
    }, [fadeAnim, nivelAluno])
  );

  // ANIMAÇÕES
  const animarClique = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.92,
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

  const animarErro = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animarAcerto = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  };

  // Selecao da resposta
  const selecionarResposta = (resposta) => {
    if (respostaConfirmada) return;

    setRespostaSelecionada(
      respostaSelecionada === resposta ? null : resposta
    );
  };

  // Funcao para confirmar a resposta e avancar a pergunta.
  const confirmarResposta = () => {

    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {

      setRespostaConfirmada(true);

      const acertou = respostaSelecionada === perguntaAtualObj.correta;

      if (acertou) {
        setAcertos(prev => prev + 1);
        animarAcerto();
      } else {
        setErros(prev => prev + 1);
        animarErro();
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    else {

      setRespostaSelecionada(null);
      setRespostaConfirmada(false);

      if (!ultimaPergunta) {
        setPerguntaAtual(prev => prev + 1);
      }

      else {

        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );

        const faseAtual = Array.isArray(params.faseId)
          ? params.faseId[0]
          : params.faseId || "1";

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(async () => {

          await atualizarPerfil("matematica", acertos, erros, faseAtual);

          router.replace({
            pathname: "/Aluno",
            params: { faseConcluida: String(faseAtual) }
          });
        });
      }
    }
  };

  // Funcao para definir a cor de cada resposta.
  const estiloBotao = (index) => {

    if (!respostaConfirmada) {
      return respostaSelecionada === index
        ? styles.botaoRespostaSelecionada
        : styles.botaoResposta;
    }

    if (index === perguntaAtualObj.correta)
      return styles.botaoRespostaCerta;

    if (index === respostaSelecionada)
      return styles.botaoRespostaErrada;

    return styles.botaoResposta;
  };

  if (!perguntaAtualObj) return null;

  return (
    <Animated.View
      style={[
        styles.telaFlex,
        {
        opacity: fadeAnim,
        transform: [{ translateX: shakeAnim }]
        }
      ]}
    >

      <ScrollView
        contentContainerStyle={styles.matematicaContainer}
      >

      <View style={styles.matematicaContent}>

        {/*  BARRA */}
        <View style={styles.barraContainer}>
          <View style={[
            styles.barraProgresso,
            { width: `${progresso * 100}%` }
          ]} />
        </View>

        <Text style={styles.textoPequeno}>
          {perguntaAtual + 1} / {perguntasSorteadas.length}
        </Text>

        <Text style={styles.textoPergunta}>
          Pergunta {perguntaAtual + 1}: {perguntaAtualObj.pergunta}
        </Text>

                {[0,1,2,3].map((i) => (
          i % 2 === 0 && (
            <View
              key={i}
              style={styles.matematicaRespostasLinha}
            >
              {[i, i+1].map(j => (
                <Animated.View
                  key={j}
                  style={[
                    styles.matematicaRespostaWrapper,
                    {
                      transform: [{ scale: scaleAnims[j] }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      estiloBotao(j),
                      styles.botaoRespostaMatematica
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
          )
        ))}

        {/* Botao de confirmar */}
        <TouchableOpacity
          onPress={confirmarResposta}
          style={[
            styles.botaoConfirmarBase,
            styles.botaoConfirmarMatematica,

            respostaSelecionada === null && !respostaConfirmada &&
              styles.botaoConfirmarVazio,

            respostaSelecionada !== null && !respostaConfirmada &&
              styles.botaoConfirmarSelecionado,

            respostaConfirmada && respostaSelecionada === perguntaAtualObj.correta &&
              styles.botaoConfirmarCerto,

            respostaConfirmada && respostaSelecionada !== perguntaAtualObj.correta &&
              styles.botaoConfirmarErrado,
          ]}
        >
          <Text style={styles.textoBotao}>
            {!respostaConfirmada
              ? "Confirmar resposta"
              : ultimaPergunta
                ? "Finalizar tarefa"
                : "Próxima pergunta"}
          </Text>
        </TouchableOpacity>

        {/*<Text style={styles.textoRodape}>
          Jesus é o melhor professor de todos os tempos!
        </Text>*/}

      </View>
      </ScrollView>
    </Animated.View>
  );
}
