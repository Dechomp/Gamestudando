export const perguntasMaker = [
  { pergunta: "Qual componente pode detectar a distância de um objeto?", respostas: ["Sensor ultrassônico", "LED", "Bateria", "Botão"], correta: 0, nivel: 1, materia: "maker" },
  { pergunta: "Qual componente emite luz?", respostas: ["Motor", "LED", "Sensor", "Bateria"], correta: 1, nivel: 1, materia: "maker" },
  { pergunta: "Qual placa usamos para programar projetos eletrônicos?", respostas: ["Arduino", "Bateria", "Protoboard", "LED"], correta: 0, nivel: 1, materia: "maker" },
  { pergunta: "Para que serve uma bateria em um projeto?", respostas: ["Produzir código", "Medir distância", "Fornecer energia", "Emitir som"], correta: 2, nivel: 1, materia: "maker" },
  { pergunta: "Qual componente pode emitir sons?", respostas: ["Buzzer", "LED", "Potenciômetro", "Protoboard"], correta: 0, nivel: 1, materia: "maker" },

  { pergunta: "Para que serve uma protoboard?", respostas: ["Armazenar energia", "Montar circuitos", "Medir temperatura", "Programar o Arduino"], correta: 1, nivel: 2, materia: "maker" },
  { pergunta: "Qual componente pode controlar a velocidade de um motor?", respostas: ["Potenciômetro", "LED", "Buzzer", "Sensor ultrassônico"], correta: 0, nivel: 2, materia: "maker" },
  { pergunta: "Qual sensor pode identificar uma linha no chão?", respostas: ["Sensor de linha", "Buzzer", "Botão", "Motor DC"], correta: 0, nivel: 2, materia: "maker" },
  { pergunta: "O que um motor DC pode fazer em um robô?", respostas: ["Girar rodas", "Medir distância", "Mostrar imagens", "Armazenar programas"], correta: 0, nivel: 2, materia: "maker" },
  { pergunta: "O que acontece quando um botão é pressionado?", respostas: ["Ele pode enviar um comando", "Ele produz combustível", "Ele mede distância", "Ele aumenta a bateria"], correta: 0, nivel: 2, materia: "maker" },

  { pergunta: "Qual função do Arduino é usada para definir um pino como entrada ou saída?", respostas: ["digitalWrite", "pinMode", "analogRead", "delay"], correta: 1, nivel: 3, materia: "maker" },
  { pergunta: "Qual função lê o valor de um sensor analógico?", respostas: ["digitalWrite", "pinMode", "analogRead", "delay"], correta: 2, nivel: 3, materia: "maker" },
  { pergunta: "Para que serve o comando delay()?", respostas: ["Criar uma pausa", "Ler um sensor", "Ligar a bateria", "Girar um motor"], correta: 0, nivel: 3, materia: "maker" },
  { pergunta: "Qual componente permite controlar um servo motor?", respostas: ["Arduino", "LED", "Protoboard", "Bateria sem conexão"], correta: 0, nivel: 3, materia: "maker" },
  { pergunta: "O que um sensor ultrassônico envia para medir distância?", respostas: ["Luz", "Som", "Calor", "Eletricidade"], correta: 1, nivel: 3, materia: "maker" },

  { pergunta: "Por que usamos uma ponte H com motores DC?", respostas: ["Para controlar o sentido do motor", "Para aumentar a luz do LED", "Para medir temperatura", "Para armazenar dados"], correta: 0, nivel: 4, materia: "maker" },
  { pergunta: "Se um robô precisa desviar de obstáculos, qual sensor pode ajudar?", respostas: ["Sensor ultrassônico", "LED", "Buzzer", "Potenciômetro"], correta: 0, nivel: 4, materia: "maker" },
  { pergunta: "Se o sensor detectar um obstáculo, o Arduino pode:", respostas: ["Tomar uma decisão no programa", "Apagar o código", "Desligar a bateria automaticamente", "Trocar o sensor"], correta: 0, nivel: 4, materia: "maker" },
  { pergunta: "Qual estrutura permite repetir comandos várias vezes?", respostas: ["if", "for", "digitalRead", "pinMode"], correta: 1, nivel: 4, materia: "maker" },
  { pergunta: "Qual estrutura permite executar uma ação quando uma condição é verdadeira?", respostas: ["if", "delay", "analogRead", "setup"], correta: 0, nivel: 4, materia: "maker" },

  { pergunta: "Um robô usa dois sensores de linha. O sensor esquerdo detecta preto e o direito branco. O que o programa pode fazer?", respostas: ["Corrigir a direção do robô", "Desligar todos os sensores", "Aumentar a bateria", "Apagar o programa"], correta: 0, nivel: 5, materia: "maker" },
  { pergunta: "Se um sensor mede uma distância menor que 10 cm, o robô pode:", respostas: ["Continuar sem verificar nada", "Desviar do obstáculo", "Apagar o Arduino", "Trocar a bateria"], correta: 1, nivel: 5, materia: "maker" },
  { pergunta: "Por que é importante organizar os fios de um projeto?", respostas: ["Para evitar conexões erradas", "Para deixar o Arduino mais rápido", "Para aumentar a memória", "Para mudar o código automaticamente"], correta: 0, nivel: 5, materia: "maker" },
  { pergunta: "Um robô precisa andar, detectar obstáculos e desviar. O que combina melhor essas funções?", respostas: ["Motor e sensor ultrassônico", "Apenas um LED", "Apenas um buzzer", "Apenas uma protoboard"], correta: 0, nivel: 5, materia: "maker" },
  { pergunta: "Antes de apresentar um projeto de robótica, qual atitude é mais importante?", respostas: ["Testar o projeto e corrigir possíveis erros", "Esconder os fios sem verificar as conexões", "Ligar tudo sem conferir a bateria", "Apagar o programa antes de testar"], correta: 0, nivel: 5, materia: "maker" },

  { pergunta: "Qual cuidado ajuda a proteger um circuito com Arduino?", respostas: ["Conferir as ligações antes de ligar a energia", "Molhar a protoboard", "Encostar os fios em qualquer lugar", "Usar uma bateria descarregada"], correta: 0, nivel: 1, materia: "maker" },
  { pergunta: "Qual componente pode ser usado para acender uma pequena luz no projeto?", respostas: ["LED", "Motor", "Sensor ultrassônico", "Buzzer"], correta: 0, nivel: 1, materia: "maker" },

  { pergunta: "Para que servem os jumpers em uma protoboard?", respostas: ["Fazer ligações entre os componentes", "Medir distância", "Guardar programas", "Produzir som"], correta: 0, nivel: 2, materia: "maker" },
  { pergunta: "Qual componente ajuda a limitar a corrente que passa por um LED?", respostas: ["Resistor", "Buzzer", "Botão", "Servo motor"], correta: 0, nivel: 2, materia: "maker" },

  { pergunta: "Qual comando pode enviar um valor alto ou baixo para um pino digital?", respostas: ["digitalWrite", "analogRead", "delay", "pinMode"], correta: 0, nivel: 3, materia: "maker" },
  { pergunta: "Qual comando é usado para ler se um botão digital está pressionado?", respostas: ["digitalRead", "digitalWrite", "delay", "setup"], correta: 0, nivel: 3, materia: "maker" },

  { pergunta: "Em um semáforo com LEDs, o programa deve fazer o quê para trocar as cores?", respostas: ["Ligar e desligar cada LED na ordem programada", "Usar somente um LED", "Desconectar a bateria", "Apagar o código"], correta: 0, nivel: 4, materia: "maker" },
  { pergunta: "Se o robô deve parar quando encontra uma parede, qual combinação é mais adequada?", respostas: ["Sensor de distância e motor", "LED e protoboard", "Buzzer e resistor", "Botão e fita adesiva"], correta: 0, nivel: 4, materia: "maker" },

  { pergunta: "Em um projeto que mede temperatura e acende um aviso, qual é a ordem mais lógica?", respostas: ["Ler o sensor, comparar o valor e acionar o aviso", "Acender tudo sem medir", "Remover o sensor", "Desligar o Arduino"], correta: 0, nivel: 5, materia: "maker" },
  { pergunta: "Se um robô segue linha e sai do caminho, o que o programa deve usar para corrigir a rota?", respostas: ["A leitura dos sensores de linha", "A cor da bateria", "Um LED desligado", "O nome do projeto"], correta: 0, nivel: 5, materia: "maker" },
];
