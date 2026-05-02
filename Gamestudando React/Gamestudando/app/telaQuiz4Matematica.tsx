import { Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { styles } from "./styles";
import { perguntasMatematica } from "./perguntasMatematicaQuiz4";

// 🔀 Embaralhar perguntas
function sortearPerguntas(lista, quantidade = 5) {
  const copia = [...lista];

  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }

  return copia.slice(0, quantidade);
}

export default function Index() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useState(new Animated.Value(1))[0];

  const [perguntasSorteadas, setPerguntasSorteadas] = useState(() =>
    sortearPerguntas(perguntasMatematica, 5)
  );

  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
  const [respostaConfirmada, setRespostaConfirmada] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState(0);

  const ultimaPergunta = perguntaAtual === perguntasSorteadas.length - 1;

  // 🔄 RESET ao entrar
  useFocusEffect(
    useCallback(() => {
      setRespostaSelecionada(null);
      setRespostaConfirmada(false);
      setPerguntaAtual(0);
      setPerguntasSorteadas(sortearPerguntas(perguntasMatematica, 5));

      fadeAnim.setValue(1); // reset do fade
    }, [])
  );

  const perguntaAtualObj = perguntasSorteadas[perguntaAtual];
  const respostaCorreta = perguntaAtualObj.correta;

  const progresso = (perguntaAtual + 1) / perguntasSorteadas.length;

  const selecionarResposta = (resposta: number) => {
    if (respostaConfirmada) return;
    setRespostaSelecionada(respostaSelecionada === resposta ? null : resposta);
  };

  const confirmarResposta = () => {
    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {
      setRespostaConfirmada(true);

      // 📳 vibração leve ao responder
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    } else {
      setRespostaSelecionada(null);
      setRespostaConfirmada(false);

      if (!ultimaPergunta) {
        setPerguntaAtual(perguntaAtual + 1);
      } else {

        // 🎉 vibração de sucesso
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const faseAtual = Array.isArray(params.faseId)
          ? params.faseId[0]
          : params.faseId || "1";

        // 🌫️ animação fade antes de sair
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          router.replace({
            pathname: "/",
            params: { faseConcluida: String(faseAtual) }
          });
        });
      }
    }
  };

  const estiloBotao = (index: number) => {
    if (!respostaConfirmada) {
      return respostaSelecionada === index
        ? styles.botaoRespostaSelecionada
        : styles.botaoResposta;
    }

    if (index === respostaCorreta) return styles.botaoRespostaCerta;

    if (index === respostaSelecionada && index !== respostaCorreta) {
      return styles.botaoRespostaErrada;
    }

    return styles.botaoResposta;
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", margin: 20 }}>

        {/* 📊 Barra */}
        <View style={styles.barraContainer}>
          <View style={[styles.barraProgresso, { width: `${progresso * 100}%` }]} />
        </View>

        <Text style={{ marginTop: 5 }}>
          {perguntaAtual + 1} / {perguntasSorteadas.length}
        </Text>

        <Text style={styles.textoPergunta}>
          Pergunta {perguntaAtual + 1}: {perguntaAtualObj.pergunta}
        </Text>

        {/* LINHA 1 */}
        <View style={{ flexDirection: "row", marginTop: 20 }}>
          {[0, 1].map(i => (
            <View key={i} style={estiloBotao(i)}>
              <TouchableOpacity onPress={() => selecionarResposta(i)}>
                <Text style={styles.textoBotao}>
                  {perguntaAtualObj.respostas[i]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* LINHA 2 */}
        <View style={{ flexDirection: "row" }}>
          {[2, 3].map(i => (
            <View key={i} style={estiloBotao(i)}>
              <TouchableOpacity onPress={() => selecionarResposta(i)}>
                <Text style={styles.textoBotao}>
                  {perguntaAtualObj.respostas[i]}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* BOTÃO */}
        <View style={[
          styles.botaoConfirmarRespostaVazio,

          respostaSelecionada !== null && (
            ultimaPergunta
              ? styles.botaoFinalizar // 🎨 estilo especial
              : styles.botaoConfirmarRespostaSelecionada
          ),

          respostaConfirmada && (
            respostaSelecionada === respostaCorreta
              ? styles.botaoConfirmarRespostaCerta
              : styles.botaoConfirmarRespostaErrada
          )
        ]}>
          <TouchableOpacity onPress={confirmarResposta}>
            <Text style={styles.textoBotao}>
              {!respostaConfirmada
                ? "Confirmar resposta"
                : ultimaPergunta
                  ? "Finalizar tarefa 🎉"
                  : "Próxima pergunta"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.textoRodape}>
          Jesus é o melhor professor de todos os tempos!
        </Text>

      </View>
    </Animated.View>
  );
}