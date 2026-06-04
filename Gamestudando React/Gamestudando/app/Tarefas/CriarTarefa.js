import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles } from '../styles';

const CriarTarefa = () => {
  // Lista de tarefas salvas localmente
  const [tarefas, setTarefas] = useState([]);

  // Disciplina selecionada
  const [disciplina, setDisciplina] = useState('Matemática');

  // Pergunta
  const [pergunta, setPergunta] = useState('');

  // Alternativas
  const [alternativas, setAlternativas] = useState(['', '', '', '']);

  // Índice da alternativa correta
  const [alternativaCorreta, setAlternativaCorreta] = useState(null);

  // Nível de dificuldade
  const [nivel, setNivel] = useState('1');

  // Atualiza o texto de uma alternativa
  const atualizarAlternativa = (texto, indice) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[indice] = texto;
    setAlternativas(novasAlternativas);
  };

  // Salva a tarefa localmente no AsyncStorage
  const salvarTarefa = async () => {
    console.log('Iniciando validação...');

    // Validação da pergunta
    if (pergunta.trim() === '') {
      console.log('Pergunta vazia');
      window.alert('Por favor, digite a pergunta da tarefa.');
      return;
    }

    // Validação das alternativas
    for (let i = 0; i < alternativas.length; i++) {
      if (alternativas[i].trim() === '') {
        console.log(`Alternativa ${i} vazia`);
        window.alert(
          `Por favor, preencha a alternativa ${String.fromCharCode(65 + i)}.`
        );
        return;
      }
    }

    // Validação da alternativa correta
    if (alternativaCorreta === null) {
      console.log('Nenhuma alternativa correta selecionada');
      window.alert(
        'Por favor, escolha qual alternativa é a resposta correta.'
      );
      return;
    }

    // Cria o objeto da tarefa
    const novaTarefa = {
      id: Date.now().toString(),
      disciplina,
      pergunta,
      alternativas,
      alternativaCorreta,
      nivel,
    };

    try {
      // Busca tarefas já salvas
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');

      // Converte para array ou cria array vazio
      const tarefasExistentes = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];

      // Adiciona a nova tarefa
      const novasTarefas = [...tarefasExistentes, novaTarefa];

      // Salva novamente no AsyncStorage
      await AsyncStorage.setItem(
        'tarefas',
        JSON.stringify(novasTarefas)
      );

      // Atualiza o contador local
      setTarefas(novasTarefas);

      // Mensagem de sucesso
      window.alert('Tarefa salva com sucesso!');

      // Limpa o formulário
      setDisciplina('Matemática');
      setPergunta('');
      setAlternativas(['', '', '', '']);
      setAlternativaCorreta(null);
      setNivel('1');

      // Mostra no console
      console.log('Tarefa salva:', novaTarefa);
    } catch (error) {
      window.alert('Não foi possível salvar a tarefa.');
      console.log('Erro ao salvar tarefa:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Criar Tarefa</Text>

      {/* Disciplina */}
      <Text style={styles.label}>Disciplina</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={disciplina}
          onValueChange={(itemValue) => setDisciplina(itemValue)}
        >
          <Picker.Item label="Matemática" value="Matemática" />
          <Picker.Item label="Português" value="Português" />
        </Picker>
      </View>

      {/* Pergunta */}
      <Text style={styles.label}>Pergunta</Text>
      <TextInput
        style={styles.inputPergunta}
        placeholder="Digite a pergunta"
        value={pergunta}
        onChangeText={setPergunta}
        multiline
      />

      {/* Alternativas */}
      <Text style={styles.label}>Respostas</Text>

      {alternativas.map((alternativa, index) => (
        <View key={index} style={styles.linhaAlternativa}>
          <Text style={styles.letra}>
            {String.fromCharCode(65 + index)}:
          </Text>

          <TextInput
            style={styles.inputAlternativa}
            placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
            value={alternativa}
            onChangeText={(texto) =>
              atualizarAlternativa(texto, index)
            }
          />

          <Switch
            value={alternativaCorreta === index}
            onValueChange={() => setAlternativaCorreta(index)}
          />
        </View>
      ))}

      {/* Nível de dificuldade */}
      <Text style={styles.label}>Nível de Dificuldade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nivel}
          onValueChange={(itemValue) => setNivel(itemValue)}
        >
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
          <Picker.Item label="5" value="5" />
          <Picker.Item label="6" value="6" />
        </Picker>
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={() => {
          console.log('Botão Salvar pressionado');
          salvarTarefa();
        }}
      >
        <Text style={styles.textoBotao}>Salvar Tarefa</Text>
      </TouchableOpacity>

      {/* Contador */}
      <Text style={styles.contador}>
        Tarefas salvas localmente: {tarefas.length}
      </Text>
    </ScrollView>
  );
};


export default CriarTarefa;
