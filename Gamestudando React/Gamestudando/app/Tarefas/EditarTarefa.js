import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, router } from 'expo-router';

import { styles } from '../styles';
import { atualizarQuestaoProfessor } from '../utils/firebaseTarefas';

const EditarTarefa = () => {
  const params = useLocalSearchParams();
  const [materia, setMateria] = useState(
    valorParam(params.materia) || normalizarMateria(valorParam(params.disciplina))
  );
  const [pergunta, setPergunta] = useState(valorParam(params.pergunta));
  const [alternativas, setAlternativas] = useState(
    lerLista(valorParam(params.respostas) || valorParam(params.alternativas), ['', '', '', ''])
  );
  const [alternativaCorreta, setAlternativaCorreta] = useState(
    Number(valorParam(params.correta) || valorParam(params.alternativaCorreta) || 0)
  );
  const [palavraA, setPalavraA] = useState(valorParam(params.esquerda));
  const [palavraB, setPalavraB] = useState(valorParam(params.direita));
  const [nivel, setNivel] = useState(valorParam(params.nivel) || '1');
  const [salvando, setSalvando] = useState(false);

  const isRima = materia === 'rimas';

  const atualizarAlternativa = (texto, indice) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[indice] = texto;
    setAlternativas(novasAlternativas);
  };

  const salvarAlteracoes = async () => {
    if (salvando) return;

    try {
      setSalvando(true);

      if (isRima) {
        if (!palavraA.trim() || !palavraB.trim()) {
          Alert.alert('Atenção', 'Preencha as duas palavras da rima.');
          return;
        }

        await atualizarQuestaoProfessor(valorParam(params.id), {
          materia: 'rimas',
          palavraA,
          palavraB,
          nivel,
        });
      } else {
        if (!pergunta.trim() || alternativas.some(alternativa => !alternativa.trim())) {
          Alert.alert('Atenção', 'Preencha a pergunta e todas as respostas.');
          return;
        }

        await atualizarQuestaoProfessor(valorParam(params.id), {
          materia,
          pergunta,
          respostas: alternativas,
          correta: alternativaCorreta,
          nivel,
        });
      }

      Alert.alert('Pronto', 'Tarefa atualizada com sucesso.');
      router.replace('/Tarefas/ListarTarefas');
    } catch (error) {
      console.log(error);

      if (error?.message === 'RIMA_DUPLICADA') {
        Alert.alert('Rima repetida', 'Ja existe uma tarefa com esse par de palavras.');
        return;
      }

      if (error?.message === 'MODERACAO_LOCAL') {
        Alert.alert(
          'Tarefa bloqueada',
          error.motivo || 'A tarefa foi bloqueada pela verificacao local.'
        );
        return;
      }

      Alert.alert('Erro', 'Nao foi possivel atualizar a tarefa.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.telaFlex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.tarefaScroll}
        contentContainerStyle={styles.tarefaContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.botaoVoltarTarefa}
          onPress={() => router.back()}
        >
          <Text style={styles.textoVoltarTarefa}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Editar Tarefa</Text>

        <Text style={styles.label}>Materia</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={materia}
            onValueChange={(itemValue) => setMateria(itemValue)}
          >
            <Picker.Item label="Matematica" value="matematica" />
            <Picker.Item label="Portugues" value="portugues" />
            <Picker.Item label="Rimas" value="rimas" />
          </Picker>
        </View>

        {isRima ? (
          <>
            <Text style={styles.label}>Primeira palavra</Text>
            <TextInput
              style={styles.input}
              value={palavraA}
              onChangeText={setPalavraA}
              placeholder="Ex: PATO"
            />

            <Text style={styles.label}>Segunda palavra</Text>
            <TextInput
              style={styles.input}
              value={palavraB}
              onChangeText={setPalavraB}
              placeholder="Ex: GATO"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Pergunta</Text>
            <TextInput
              style={styles.inputPergunta}
              value={pergunta}
              onChangeText={setPergunta}
              multiline
            />

            <Text style={styles.label}>Respostas</Text>
            {alternativas.map((alternativa, index) => (
              <View key={index} style={styles.linhaAlternativa}>
                <Text style={styles.letra}>
                  {String.fromCharCode(65 + index)}:
                </Text>

                <TextInput
                  style={styles.inputAlternativa}
                  value={alternativa}
                  onChangeText={(texto) => atualizarAlternativa(texto, index)}
                />

                <Switch
                  value={alternativaCorreta === index}
                  onValueChange={() => setAlternativaCorreta(index)}
                />
              </View>
            ))}
          </>
        )}

        <Text style={styles.label}>Nivel de Dificuldade</Text>
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

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvarAlteracoes}
        >
          <Text style={styles.textoBotao}>
            {salvando ? 'Salvando...' : 'Salvar Alteracoes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function valorParam(valor) {
  if (Array.isArray(valor)) return valor[0] || '';
  return valor || '';
}

function lerLista(valor, fallback) {
  if (!valor) return fallback;

  try {
    const lista = JSON.parse(valor);
    return Array.isArray(lista) ? lista : fallback;
  } catch (error) {
    console.log(error);
    return fallback;
  }
}

function normalizarMateria(materia) {
  const texto = String(materia).toLowerCase();

  if (texto.includes('rima')) return 'rimas';
  if (texto.includes('port')) return 'portugues';
  return 'matematica';
}

export default EditarTarefa;
