import { Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { styles } from "./styles";
import { perguntasMatematica } from "./perguntasMatematicaQuiz4";


// 🔀 Função para embaralhar e pegar X perguntas
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

  // 🎯 perguntas sorteadas (roda só uma vez)
  const [perguntasSorteadas] = useState(() =>
    sortearPerguntas(perguntasMatematica, 5)
  );

  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostaConfirmada, setRespostaConfirmada] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState(0);

  const perguntaAtualObj = perguntasSorteadas[perguntaAtual];
  const respostaCorreta = perguntaAtualObj.correta;

  // 📊 progresso
  const progresso = (perguntaAtual + 1) / perguntasSorteadas.length;

  const selecionarResposta = (resposta) => {
    if (respostaConfirmada) return;
    setRespostaSelecionada(respostaSelecionada === resposta ? null : resposta);
  };

  const confirmarResposta = () => {
    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {
      setRespostaConfirmada(true);
    } else {
      setRespostaSelecionada(null);
      setRespostaConfirmada(false);

      if (perguntaAtual < perguntasSorteadas.length - 1) {
        setPerguntaAtual(perguntaAtual + 1);
      } else {
        // 🔥 volta pro mapa liberando próxima fase
        router.replace({
          pathname: "/",
          params: { faseConcluida: params.faseId }
        });
      }
    }
  };

  const estiloBotao = (index) => {
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", margin: 20 }}>

      {/* 📊 Barra de progresso */}
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
        {[0,1].map(i => (
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
        {[2,3].map(i => (
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
        respostaSelecionada !== null && styles.botaoConfirmarRespostaSelecionada,
        respostaConfirmada && (
          respostaSelecionada === respostaCorreta
            ? styles.botaoConfirmarRespostaCerta
            : styles.botaoConfirmarRespostaErrada
        )
      ]}>
        <TouchableOpacity onPress={confirmarResposta}>
          <Text style={styles.textoBotao}>
            {respostaConfirmada ? "Próxima pergunta" : "Confirmar resposta"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.textoRodape}>
        Jesus é o melhor professor de todos os tempos!
      </Text>

    </View>
  );
}