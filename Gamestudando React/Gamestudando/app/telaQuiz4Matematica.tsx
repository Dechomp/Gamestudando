import { Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import { styles } from "./styles";
import { perguntasMatematica } from "./perguntasMatematicaQuiz4";

export default function Index() {

  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostaConfirmada, setRespostaConfirmada] = useState(false);
  const [perguntaAtual, setPerguntaAtual] = useState(0);

  // ✅ MELHOR FORMA (evita bug e deixa mais limpo)
  const perguntaAtualObj = perguntasMatematica[perguntaAtual];
  const respostaCorreta = perguntaAtualObj.correta;



  //Barra de progresso
  const progresso = (perguntaAtual + 1) / perguntasMatematica.length;

  const selecionarResposta = (resposta) => {

    if (respostaConfirmada) return;

    if (respostaSelecionada === resposta) {
      setRespostaSelecionada(null);
    } else {
      setRespostaSelecionada(resposta);
    }
  };

  const confirmarResposta = () => {

    if (respostaSelecionada === null && !respostaConfirmada) return;

    if (!respostaConfirmada) {
      setRespostaConfirmada(true);
    } 
    else {
      setRespostaSelecionada(null);
      setRespostaConfirmada(false);

      if (perguntaAtual < perguntasMatematica.length - 1) {
        setPerguntaAtual(perguntaAtual + 1);
      } else {
        setPerguntaAtual(0);
      }
    }
  };

  const estiloBotao = (index) => {

    if (!respostaConfirmada) {
      return respostaSelecionada === index
        ? styles.botaoRespostaSelecionada
        : styles.botaoResposta;
    }

    // ✅ mostra a correta
    if (index === respostaCorreta) {
      return styles.botaoRespostaCerta;
    }

    // ❌ mostra erro
    if (index === respostaSelecionada && index !== respostaCorreta) {
      return styles.botaoRespostaErrada;
    }

    return styles.botaoResposta;
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
      }}
    >
      {/* 📊 Barra de progresso */}
      <View style={styles.barraContainer}>
        <View
          style={[
            styles.barraProgresso,
            { width: `${progresso * 100}%` }
          ]}
        />
      </View>

      <Text style={{ marginTop: 5 }}>
        {perguntaAtual + 1} / {perguntasMatematica.length}
      </Text>

      <Text style={styles.textoPergunta}>
        Pergunta {perguntaAtual + 1}: {perguntaAtualObj.pergunta}
      </Text>

      {/* LINHA 1 */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>

        <View style={estiloBotao(0)}>
          <TouchableOpacity onPress={() => selecionarResposta(0)}>
            <Text style={styles.textoBotao}>
              {perguntaAtualObj.respostas[0]}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={estiloBotao(1)}>
          <TouchableOpacity onPress={() => selecionarResposta(1)}>
            <Text style={styles.textoBotao}>
              {perguntaAtualObj.respostas[1]}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* LINHA 2 */}
      <View style={{ flexDirection: "row" }}>

        <View style={estiloBotao(2)}>
          <TouchableOpacity onPress={() => selecionarResposta(2)}>
            <Text style={styles.textoBotao}>
              {perguntaAtualObj.respostas[2]}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={estiloBotao(3)}>
          <TouchableOpacity onPress={() => selecionarResposta(3)}>
            <Text style={styles.textoBotao}>
              {perguntaAtualObj.respostas[3]}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* BOTÃO */}
      <View
        style={[
          styles.botaoConfirmarRespostaVazio,

          respostaSelecionada !== null && styles.botaoConfirmarRespostaSelecionada,

          respostaConfirmada && (
            respostaSelecionada === respostaCorreta
              ? styles.botaoConfirmarRespostaCerta
              : styles.botaoConfirmarRespostaErrada
          )
        ]}
      >

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