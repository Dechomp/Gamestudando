import React from 'react';
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { styles } from '../styles';
import { excluirQuestaoProfessor } from '../utils/firebaseTarefas';

const DetalheTarefa = () => {
  const params = useLocalSearchParams();
  const materia = valorParam(params.disciplina) || tituloMateria(valorParam(params.materia));
  const formato = valorParam(params.formato);
  const pergunta = valorParam(params.pergunta);
  const alternativas = lerLista(valorParam(params.respostas) || valorParam(params.alternativas));
  const alternativaCorreta = Number(valorParam(params.correta) || valorParam(params.alternativaCorreta));
  const esquerda = valorParam(params.esquerda);
  const direita = valorParam(params.direita);

  const editarTarefa = () => {
    router.push({
      pathname: '/Tarefas/EditarTarefa',
      params: params,
    });
  };

  const confirmarExclusao = () => {
    Alert.alert(
      'Excluir tarefa',
      'Deseja realmente excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: excluirTarefa,
        },
      ]
    );
  };

  const excluirTarefa = async () => {
    try {
      await excluirQuestaoProfessor(valorParam(params.id));
      Alert.alert('Pronto', 'Tarefa excluida com sucesso.');
      router.replace('/Tarefas/ListarTarefas');
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Nao foi possivel excluir a tarefa.');
    }
  };

  return (
    <ScrollView
      style={styles.tarefaScroll}
      contentContainerStyle={styles.tarefaContent}
    >
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => router.back()}
      >
        <Text style={styles.textoVoltarTarefa}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Detalhes da Tarefa</Text>

      <Text style={styles.label}>Materia</Text>
      <Text style={styles.pergunta}>{materia || 'Atividade'}</Text>

      <Text style={styles.label}>Formato</Text>
      <Text style={styles.pergunta}>
        {formato === 'conectar_pares' ? 'Rimas' : 'Multipla escolha'}
      </Text>

      {formato === 'conectar_pares' ? (
        <>
          <Text style={styles.label}>Par de rimas</Text>

          <View style={styles.card}>
            <Text style={styles.pergunta}>{esquerda || '-'}</Text>
            <Text style={styles.pergunta}>{direita || '-'}</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>Pergunta</Text>
          <Text style={styles.pergunta}>{pergunta || '-'}</Text>

          <Text style={styles.label}>Alternativas</Text>

          {alternativas.map((alternativa, index) => (
            <View
              key={`${alternativa}-${index}`}
              style={[
                styles.card,
                alternativaCorreta === index &&
                  styles.tarefaRespostaCorretaCard,
              ]}
            >
              <Text style={styles.pergunta}>
                {String.fromCharCode(65 + index)}) {alternativa}
              </Text>

              {alternativaCorreta === index && (
                <Text style={styles.tarefaRespostaCorretaTexto}>
                  Resposta correta
                </Text>
              )}
            </View>
          ))}
        </>
      )}

      <Text style={styles.label}>Nivel de Dificuldade</Text>
      <Text style={styles.pergunta}>{valorParam(params.nivel) || '1'}</Text>

      <Text style={styles.label}>Status</Text>
      <Text style={styles.pergunta}>
        {textoStatus(valorParam(params.statusRevisao))}
      </Text>

      <TouchableOpacity
        style={styles.botaoEditarTarefa}
        onPress={editarTarefa}
      >
        <Text style={styles.textoBotao}>Editar Tarefa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoExcluirTarefa}
        onPress={confirmarExclusao}
      >
        <Text style={styles.textoBotao}>Excluir Tarefa</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

function valorParam(valor) {
  if (Array.isArray(valor)) return valor[0] || '';
  return valor || '';
}

function lerLista(valor) {
  if (!valor) return [];

  try {
    const lista = JSON.parse(valor);
    return Array.isArray(lista) ? lista : [];
  } catch (error) {
    console.log(error);
    return [];
  }
}

function tituloMateria(materia) {
  if (materia === 'rimas') return 'Rimas';
  if (materia === 'portugues') return 'Portugues';
  if (materia === 'matematica') return 'Matematica';
  return materia;
}

function textoStatus(status) {
  if (status === 'aprovada') return 'aprovada';
  if (status === 'rejeitada') return 'rejeitada';
  if (status === 'pendente_ia') return 'em revisao automatica';
  return status || 'pendente';
}

export default DetalheTarefa;
