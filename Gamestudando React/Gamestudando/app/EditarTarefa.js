import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, router } from 'expo-router';

const EditarTarefa = () => {
  const params = useLocalSearchParams();

  const [disciplina, setDisciplina] = useState(
    params.disciplina || 'Matemática'
  );

  const [pergunta, setPergunta] = useState(
    params.pergunta || ''
  );

  const [alternativas, setAlternativas] = useState(
    params.alternativas
      ? JSON.parse(params.alternativas)
      : ['', '', '', '']
  );

  const [alternativaCorreta, setAlternativaCorreta] = useState(
    Number(params.alternativaCorreta)
  );

  const [nivel, setNivel] = useState(
    params.nivel || '1'
  );

  const atualizarAlternativa = (texto, indice) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[indice] = texto;
    setAlternativas(novasAlternativas);
  };

  const salvarAlteracoes = async () => {
    try {
      const tarefasSalvas =
        await AsyncStorage.getItem('tarefas');

      const tarefas = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];

      const tarefasAtualizadas = tarefas.map(
        (tarefa) => {
          if (tarefa.id === params.id) {
            return {
              ...tarefa,
              disciplina,
              pergunta,
              alternativas,
              alternativaCorreta,
              nivel,
            };
          }

          return tarefa;
        }
      );

      await AsyncStorage.setItem(
        'tarefas',
        JSON.stringify(tarefasAtualizadas)
      );

      window.alert('Tarefa atualizada com sucesso!');

      router.push('/ListarTarefas');
    } catch (error) {
      console.log(error);
      window.alert(
        'Erro ao atualizar a tarefa.'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        Editar Tarefa
      </Text>

      <Text style={styles.label}>
        Disciplina
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={disciplina}
          onValueChange={(itemValue) =>
            setDisciplina(itemValue)
          }
        >
          <Picker.Item
            label="Matemática"
            value="Matemática"
          />
          <Picker.Item
            label="Português"
            value="Português"
          />
        </Picker>
      </View>

      <Text style={styles.label}>
        Pergunta
      </Text>

      <TextInput
        style={styles.inputPergunta}
        value={pergunta}
        onChangeText={setPergunta}
        multiline
      />

      <Text style={styles.label}>
        Respostas
      </Text>

      {alternativas.map((alternativa, index) => (
        <View
          key={index}
          style={styles.linhaAlternativa}
        >
          <Text style={styles.letra}>
            {String.fromCharCode(65 + index)}:
          </Text>

          <TextInput
            style={styles.inputAlternativa}
            value={alternativa}
            onChangeText={(texto) =>
              atualizarAlternativa(
                texto,
                index
              )
            }
          />

          <Switch
            value={
              alternativaCorreta === index
            }
            onValueChange={() =>
              setAlternativaCorreta(index)
            }
          />
        </View>
      ))}

      <Text style={styles.label}>
        Nível de Dificuldade
      </Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nivel}
          onValueChange={(itemValue) =>
            setNivel(itemValue)
          }
        >
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
          <Picker.Item label="5" value="5" />
          <Picker.Item label="6" value="6" />
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.botaoSalvar}
        onPress={salvarAlteracoes}
      >
        <Text style={styles.textoBotao}>
          Salvar Alterações
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4A90E2',
    marginBottom: 25,
  },

  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 15,
    color: '#333',
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },

  inputPergunta: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#F9F9F9',
  },

  linhaAlternativa: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  letra: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },

  inputAlternativa: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#F9F9F9',
  },

  botaoSalvar: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 20,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditarTarefa;