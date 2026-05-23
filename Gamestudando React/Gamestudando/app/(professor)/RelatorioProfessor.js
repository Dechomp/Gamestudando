import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';

const RelatorioProfessor = () => {
  const dadosTurmas = [
    {
      id: 'T1',
      nome: 'Turma A - Manha',
      alunos: [
        { id: 'A1', nome: 'Joaozinho', acessos: '15 dias', tempo: '10h' },
        { id: 'A2', nome: 'Mariazinha', acessos: '12 dias', tempo: '08h' },
      ]
    },
    {
      id: 'T2',
      nome: 'Turma B - Tarde',
      alunos: [
        { id: 'A3', nome: 'Pedro', acessos: '5 dias', tempo: '02h' },
        { id: 'A4', nome: 'Ana', acessos: '20 dias', tempo: '15h' },
      ]
    }
  ];

  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  return (
    <ScrollView style={styles.portalContainer}>
      <Text style={styles.portalTituloMenor}>Portal do Professor</Text>

      <Text style={styles.label}>Selecione a Turma:</Text>
      {dadosTurmas.map((turma) => (
        <TouchableOpacity
          key={turma.id}
          style={[
            styles.portalBotao,
            turmaSelecionada?.id === turma.id && styles.portalBotaoAtivo
          ]}
          onPress={() => {
            setTurmaSelecionada(turma);
            setAlunoSelecionado(null);
          }}
        >
          <Text>{turma.nome}</Text>
        </TouchableOpacity>
      ))}

      {turmaSelecionada && (
        <View style={styles.portalSecao}>
          <Text style={styles.label}>Alunos da {turmaSelecionada.nome}:</Text>
          {turmaSelecionada.alunos.map((aluno) => (
            <TouchableOpacity
              key={aluno.id}
              style={styles.portalBotaoAluno}
              onPress={() => setAlunoSelecionado(aluno)}
            >
              <Text>{aluno.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {alunoSelecionado && (
        <View style={styles.portalQuadroRelatorio}>
          <Text style={styles.portalSubtitulo}>
            Relatorio de {alunoSelecionado.nome}
          </Text>
          <Text>Acessos: {alunoSelecionado.acessos}</Text>
          <Text>Tempo total: {alunoSelecionado.tempo}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default RelatorioProfessor;
