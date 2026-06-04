import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from '../styles';
import CriarAtividade from './CriarAtividade';
import CriarTurma from './CriarTurma';

const CriarProfessor = () => {
  const [tipoCriacao, setTipoCriacao] = useState('tarefa');

  return (
    <KeyboardAvoidingView
      style={styles.authKeyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.tarefaScroll}
        contentContainerStyle={styles.tarefaContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.seletorCriacaoContainer}>
          <TouchableOpacity
            style={[
              styles.seletorCriacaoBotao,
              tipoCriacao === 'tarefa' && styles.seletorCriacaoAtivo,
            ]}
            onPress={() => setTipoCriacao('tarefa')}
          >
            <Text
              style={[
                styles.seletorCriacaoTexto,
                tipoCriacao === 'tarefa' && styles.seletorCriacaoTextoAtivo,
              ]}
            >
              Tarefa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.seletorCriacaoBotao,
              tipoCriacao === 'turma' && styles.seletorCriacaoAtivo,
            ]}
            onPress={() => setTipoCriacao('turma')}
          >
            <Text
              style={[
                styles.seletorCriacaoTexto,
                tipoCriacao === 'turma' && styles.seletorCriacaoTextoAtivo,
              ]}
            >
              Turma
            </Text>
          </TouchableOpacity>
        </View>

        {tipoCriacao === 'tarefa' ? (
          <CriarAtividade embutida />
        ) : (
          <CriarTurma />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CriarProfessor;
