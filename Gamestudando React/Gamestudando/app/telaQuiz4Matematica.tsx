import { Text, View, TouchableOpacity, Animated } from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { styles } from "./styles";
import { perguntasMatematica } from "./perguntasMatematicaQuiz4";
import { atualizarPerfil, carregarPerfil } from "./utils/perfilAluno";

// =========================
// 🔀 EMBARALHAR
// =========================
function embaralhar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

// =========================
// 🧠 IA (níveis 1–10)
// =========================
function selecionarPerguntasIA(lista, nivelAluno = 3, quantidade = 5) {
  const abaixo = lista.filter(p => p.nivel === nivelAluno - 1);
  const base = lista.filter(p => p.nivel === nivelAluno);
  const acima = lista.filter(p => p.nivel === nivelAluno + 1);

  const resultado = [];

  resultado.push(...embaralhar(base).slice(0, 3));
  resultado.push(...embaralhar(acima).slice(0, 1));
  resultado.push(...embaralhar(abaixo).slice(0, 1));

  return embaralhar(resultado).slice(0, quantidade);
}

export default function Index() {

  const router = useRouter();
  const params = useLocalSearchParams();

  const fadeAnim = useState(new Animated.Value(1))[0];

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

  // =========================
  // 📥 CARREGAR PERFIL
  // =========================
  useEffect(() => {
    const carregarNivel = async () => {
      const perfil = await carregarPerfil();

      const nivel = perfil?.matematica?.nivel || 3;
      setNivelAluno(nivel);

      const perguntas = selecionarPerguntasIA(
        perguntasMatematica,
        nivel,
        5
      );

      setPerguntasSorteadas(perguntas);
    };

    carregarNivel();
  }, []);

  // =========================
  // 🔄 RESET AO ENTRAR
  // =========================
  useFocusEffect(
    useCallback(() => {

      setRespostaSelecionada(null);
      setRespostaConfirmada(false);
      setPerguntaAtual(0);

      const perguntas = selecionarPerguntasIA(
        perguntasMatematica,
        nivelAluno,
        5
      );

      setPerguntasSorteadas(perguntas);

      fadeAnim.setValue(1);

    }, [nivelAluno])
  );

  // =========================
  // 👆 SELEÇÃO
  // =========================
  const selecionarResposta = (resposta) => {
    if (respostaConfirmada) return;

    setRespostaSelecionada(
      respostaSelecionada === resposta ? null : resposta
    );
  };

  // =========================
  // 🧠 CONFIRMAR RESPOSTA
  // =========================
  const confirmarResposta = () => {

    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {

      setRespostaConfirmada(true);

      const acertou = respostaSelecionada === perguntaAtualObj.correta;

      if (acertou) setAcertos(prev => prev + 1);
      else setErros(prev => prev + 1);

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

          await atualizarPerfil("matematica", acertos, erros);

          router.replace({
            pathname: "/",
            params: { faseConcluida: String(faseAtual) }
          });
        });
      }
    }
  };

  // =========================
  // 🎨 ESTILO (VISUAL ORIGINAL RESTAURADO)
  // =========================
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
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>

      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 20
      }}>

        {/* 📊 BARRA */}
        <View style={styles.barraContainer}>
          <View style={[
            styles.barraProgresso,
            { width: `${progresso * 100}%` }
          ]} />
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
              ? styles.botaoFinalizar
              : styles.botaoConfirmarRespostaSelecionada
          ),

          respostaConfirmada && (
            respostaSelecionada === perguntaAtualObj.correta
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