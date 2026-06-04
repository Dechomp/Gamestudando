import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { styles } from '../styles';
import { listarQuestoesDoProfessor } from '../utils/firebaseTarefas';

const ListaTarefas = () => {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const carregarTarefas = async () => {
    try {
      setCarregando(true);
      const lista = await listarQuestoesDoProfessor();
      setTarefas(lista);
    } catch (error) {
      console.log(error);
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarTarefas();
    }, [])
  );

  const abrirDetalhes = (item) => {
    const respostas = item.respostas || item.alternativas || [];

    router.push({
      pathname: '/Tarefas/DetalhesTarefa',
      params: {
        id: item.id,
        materia: item.materia || '',
        disciplina: tituloMateria(item),
        formato: item.formato || '',
        pergunta: item.pergunta || '',
        respostas: JSON.stringify(respostas),
        alternativas: JSON.stringify(respostas),
        correta: String(item.correta ?? item.alternativaCorreta ?? ''),
        alternativaCorreta: String(item.correta ?? item.alternativaCorreta ?? ''),
        nivel: String(item.nivel || 1),
        statusRevisao: item.statusRevisao || 'pendente',
        esquerda: item.esquerda?.texto || '',
        direita: item.direita?.texto || '',
      },
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => abrirDetalhes(item)}
    >
      <Text style={styles.disciplina}>
        {tituloMateria(item)}
      </Text>

      <Text style={styles.pergunta} numberOfLines={2}>
        {tituloTarefa(item)}
      </Text>

      <Text style={styles.nivel}>
        Nivel de dificuldade: {item.nivel}
      </Text>

      <Text style={styles.legendaTexto}>
        Status: {textoStatus(item.statusRevisao)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.portalContainer}>
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => router.push('/Professor/PerfilProfessor')}
      >
        <Text style={styles.textoVoltarTarefa}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Lista de Tarefas</Text>

      {carregando ? (
        <Text style={styles.contador}>
          Carregando tarefas...
        </Text>
      ) : tarefas.length === 0 ? (
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

function tituloMateria(item) {
  if (item.materia === 'rimas') return 'Rimas';
  if (item.materia === 'portugues') return 'Portugues';
  if (item.materia === 'matematica') return 'Matematica';
  return item.materia || 'Atividade';
}

function tituloTarefa(item) {
  if (item.formato === 'conectar_pares') {
    return `${item.esquerda?.texto || ''} / ${item.direita?.texto || ''}`;
  }

  return item.pergunta || 'Atividade';
}

function textoStatus(status) {
  if (status === 'aprovada') return 'aprovada';
  if (status === 'rejeitada') return 'rejeitada';
  if (status === 'pendente_ia') return 'em revisao automatica';
  return status || 'pendente';
}

export default ListaTarefas;
