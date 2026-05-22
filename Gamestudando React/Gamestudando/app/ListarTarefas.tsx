import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect , router } from 'expo-router';
import { styles } from './styles';

const ListaTarefas = () => {
  const [tarefas, setTarefas] = useState([]);

  const carregarTarefas = async () => {
    try {
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');
      const lista = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];
      setTarefas(lista);
    } catch (error) {
      console.log(error);
    }
  };

  // Recarrega toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [])
  );

  const visualizarTarefa = (tarefa) => {
    router.push({
      pathname: '/DetalhesTarefa',
      params: {
        id: tarefa.id,
        disciplina: tarefa.disciplina,
        pergunta: tarefa.pergunta,
        alternativas: JSON.stringify(tarefa.alternativas),
        alternativaCorreta: tarefa.alternativaCorreta.toString(),
        nivel: tarefa.nivel,
      },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => visualizarTarefa(item)}
    >
      <Text style={styles.disciplina}>
        {item.disciplina}
      </Text>
      <Text style={styles.pergunta} numberOfLines={2}>
        {item.pergunta}
      </Text>
      <Text style={styles.nivel}>
        Nível de dificuldade: {item.nivel}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Tarefas</Text>

      {tarefas.length === 0 ? (
        <Text style={styles.contador}>
          Nenhuma tarefa cadastrada.
        </Text>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
};

export default ListaTarefas;