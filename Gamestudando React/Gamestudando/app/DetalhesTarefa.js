import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { styles } from './styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetalheTarefa = () => {
  const params = useLocalSearchParams();

  const alternativas = JSON.parse(params.alternativas || '[]');
  const alternativaCorreta = Number(params.alternativaCorreta);

  const editarTarefa = () => { 
    
    router.push({
    pathname: '/EditarTarefa',
    params: {
      id: params.id,
      disciplina: params.disciplina,
      pergunta: params.pergunta,
      alternativas: params.alternativas,
      alternativaCorreta: params.alternativaCorreta,
      nivel: params.nivel,
    },
  });
};

  const excluirTarefa = async () => {
  const confirmar = window.confirm(
    'Deseja realmente excluir esta tarefa?'
  );

  if (!confirmar) {
    return;
  }

  try {
    const tarefasSalvas =
      await AsyncStorage.getItem('tarefas');

    const tarefas = tarefasSalvas
      ? JSON.parse(tarefasSalvas)
      : [];

    const tarefasAtualizadas =
      tarefas.filter(
        (tarefa) => tarefa.id !== params.id
      );

    await AsyncStorage.setItem(
      'tarefas',
      JSON.stringify(tarefasAtualizadas)
    );

    window.alert(
      'Tarefa excluída com sucesso!'
    );

    router.push('/ListarTarefas');
  } catch (error) {
    console.log(error);

    window.alert(
      'Erro ao excluir a tarefa.'
    );
  }
};

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={styles.titulo}>Detalhes da Tarefa</Text>

      <Text style={styles.label}>Disciplina</Text>
      <Text style={styles.pergunta}>{params.disciplina}</Text>

      <Text style={styles.label}>Pergunta</Text>
      <Text style={styles.pergunta}>{params.pergunta}</Text>

      <Text style={styles.label}>Alternativas</Text>

      {alternativas.map((alternativa, index) => (
        <View
          key={index}
          style={[
            styles.card,
            alternativaCorreta === index && {
              borderColor: '#4CAF50',
              borderWidth: 2,
            },
          ]}
        >
          <Text style={styles.pergunta}>
            {String.fromCharCode(65 + index)}) {alternativa}
          </Text>

          {alternativaCorreta === index && (
            <Text
              style={{
                color: '#4CAF50',
                fontWeight: 'bold',
                marginTop: 5,
              }}
            >
              ✓ Resposta Correta
            </Text>
          )}
        </View>
      ))}

      <Text style={styles.label}>Nível de Dificuldade</Text>
      <Text style={styles.pergunta}>{params.nivel}</Text>

      <TouchableOpacity
        style={{
          backgroundColor: '#F9A825',
          padding: 15,
          borderRadius: 8,
          marginTop: 20,
        }}
        onPress={editarTarefa}
      >
        <Text
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Editar Tarefa
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#E53935',
          padding: 15,
          borderRadius: 8,
          marginTop: 10,
          marginBottom: 20,
        }}
        onPress={excluirTarefa}
      >
        <Text
          style={{
            color: '#FFF',
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Excluir Tarefa
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DetalheTarefa;