// Importação dos componentes básicos do React Native
import { Text, View, TouchableOpacity } from "react-native";

// Hook do React para controlar estados da aplicação
import { useState } from "react";

// Importação dos estilos do arquivo styles.js
import { styles } from "./styles";

// Importação do banco de perguntas do arquivo perguntas.js
import { perguntas } from "./perguntasQuiz4Respostas";

export default function Index() {

  // Estado que guarda qual resposta o usuário selecionou
  // Começa como null porque nenhuma resposta foi escolhida ainda
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);

  // Estado que indica se a resposta já foi confirmada
  // Serve para travar os botões e mostrar as cores de acerto ou erro
  const [respostaConfirmada, setRespostaConfirmada] = useState(false);

  // Estado que guarda qual pergunta está sendo exibida no momento
  // Começa na pergunta 0 (primeira pergunta do array)
  const [perguntaAtual, setPerguntaAtual] = useState(0);

  // Cálculo do progresso do quiz, para mostrar uma barra de progresso
  const progresso = (perguntaAtual + 1) / perguntas.length;

  // Define qual é a resposta correta da pergunta atual
  // Pega essa informação do array de perguntas
  const respostaCorreta = perguntas[perguntaAtual].correta;  


  // Função chamada quando o usuário toca em uma resposta
  const selecionarResposta = (resposta) => {

    // Se a resposta já foi confirmada, não permite selecionar outra
    if (respostaConfirmada) return;

    // Se clicar novamente na mesma resposta, ela é desmarcada
    if (respostaSelecionada === resposta) {
      setRespostaSelecionada(null);
    } 
    // Caso contrário, salva a nova resposta escolhida
    else {
      setRespostaSelecionada(resposta);
    }
    
  };


  // Função responsável por confirmar a resposta ou avançar para a próxima pergunta
  const confirmarResposta = () => {

    // Se nenhuma resposta foi selecionada e ainda não foi confirmada, não faz nada
    if (respostaSelecionada === null && !respostaConfirmada) return;

    // Primeiro clique: confirmar resposta
    if (!respostaConfirmada) {
      setRespostaConfirmada(true);
    } 
    
    // Segundo clique: ir para a próxima pergunta
    else {

      // Limpa a resposta selecionada
      setRespostaSelecionada(null);

      // Reseta o estado de confirmação
      setRespostaConfirmada(false);

      // Verifica se ainda existem perguntas no array
      if (perguntaAtual < perguntas.length - 1) {

        // Avança para a próxima pergunta
        setPerguntaAtual(perguntaAtual + 1);

      } 
      else {

        // Se chegou na última pergunta, volta para a primeira
        setPerguntaAtual(0);

      }
    }

  };


  // Função que define o estilo de cada botão de resposta
  const estiloBotao = (letra) => {

    // Antes da confirmação da resposta
    if (!respostaConfirmada) {

      // Se a resposta estiver selecionada, mostra o estilo de seleção
      return respostaSelecionada === letra
        ? styles.botaoRespostaSelecionada
        : styles.botaoResposta;
    }

    // Após confirmar a resposta

    // Se o botão for a resposta correta, pinta de verde
    if (letra === respostaCorreta) {
      return styles.botaoRespostaCerta;
    }

    // Se o botão foi selecionado e está errado, pinta de vermelho
    if (letra === respostaSelecionada && respostaSelecionada !== respostaCorreta) {
      return styles.botaoRespostaErrada;
    }

    // Caso contrário mantém o estilo padrão
    return styles.botaoResposta;

  };


  // Estrutura visual da tela
  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 20,
      }}
    >
      {/* Texto de progresso (ex: "2 / 10") */}
      <Text>
        {perguntaAtual + 1} / {perguntas.length}
      </Text>

      {/* Barra de progresso */}
      <View style={styles.barraFundo}>
        <View 
          style={[
            styles.barraProgresso,
            { width: `${progresso * 100}%` }
          ]}
        />
      </View>

    
      

     {/* Texto da pergunta */}
     <Text style={styles.textoPergunta}>
       Pergunta {perguntaAtual + 1}: {perguntas[perguntaAtual].pergunta}
     </Text>




      {/* Primeira linha de respostas */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
        }}
      >

        {/* Resposta 1 */}
        <View style={estiloBotao(0)}>
          <TouchableOpacity onPress={() => selecionarResposta(0)}>
            <Text style={styles.textoBotao}>
              {perguntas[perguntaAtual].respostas[0]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resposta 2 */}
        <View style={estiloBotao(1)}>
          <TouchableOpacity onPress={() => selecionarResposta(1)}>
            <Text style={styles.textoBotao}>
              {perguntas[perguntaAtual].respostas[1]}
            </Text>
          </TouchableOpacity>
        </View>

      </View>


      {/* Segunda linha de respostas */}
      <View
        style={{
          flexDirection: "row",
        }}
      >

        {/* Resposta 3 */}
        <View style={estiloBotao(2)}>
          <TouchableOpacity onPress={() => selecionarResposta(2)}>
            <Text style={styles.textoBotao}>
              {perguntas[perguntaAtual].respostas[2]}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Resposta 4 */}
        <View style={estiloBotao(3)}>
          <TouchableOpacity onPress={() => selecionarResposta(3)}>
            <Text style={styles.textoBotao}>
              {perguntas[perguntaAtual].respostas[3]}
            </Text>
          </TouchableOpacity>
        </View>

      </View>


      {/* Botão de confirmar resposta */}
      <View
        style={[
          styles.botaoConfirmarRespostaVazio,

          // Quando alguma resposta está selecionada
          respostaSelecionada !== null && styles.botaoConfirmarRespostaSelecionada,

          // Após confirmação da resposta
          respostaConfirmada && (
            respostaSelecionada === respostaCorreta
              ? styles.botaoConfirmarRespostaCerta
              : styles.botaoConfirmarRespostaErrada
          )
        ]}
      >

        <TouchableOpacity onPress={confirmarResposta}>

          {/* Texto muda dependendo do estado */}
          <Text style={styles.textoBotao}>
            {respostaConfirmada ? "Próxima pergunta" : "Confirmar resposta"}
          </Text>

        </TouchableOpacity>

      </View>


      {/* Texto de rodapé */}
      <Text style={styles.textoRodape}>
        Jesus é o melhor professor de todos os tempos!
      </Text>

    </View>

  );

}