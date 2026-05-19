import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';

const RelatorioProfessor = () => {
  // 1. Dados de exemplo: Turmas e seus respectivos Alunos
  const dadosTurmas = [
    {
      id: 'T1',
      nome: 'Turma A - Manhã',
      alunos: [
        { id: 'A1', nome: 'Joãozinho', acessos: '15 dias', tempo: '10h' },
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

  // Estados para "lembrar" o que foi clicado
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Portal do Professor</Text>

      {/* PASSO 1: Escolher a Turma */}
      <Text style={styles.label}>Selecione a Turma:</Text>
      {dadosTurmas.map((turma) => (
        <TouchableOpacity 
          key={turma.id} 
          style={[styles.botao, turmaSelecionada?.id === turma.id && styles.botaoAtivo]}
          onPress={() => {
            setTurmaSelecionada(turma);
            setAlunoSelecionado(null); // Limpa o aluno se mudar de turma
          }}
        >
          <Text>{turma.nome}</Text>
        </TouchableOpacity>
      ))}

      {/* PASSO 2: Escolher o Aluno (só aparece se uma turma for escolhida) */}
      {turmaSelecionada && (
        <View style={styles.secao}>
          <Text style={styles.label}>Alunos da {turmaSelecionada.nome}:</Text>
          {turmaSelecionada.alunos.map((aluno) => (
            <TouchableOpacity 
              key={aluno.id} 
              style={styles.botaoAluno}
              onPress={() => setAlunoSelecionado(aluno)}
            >
              <Text>{aluno.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* PASSO 3: Mostrar o Relatório (só aparece se o aluno for escolhido) */}
      {alunoSelecionado && (
        <View style={styles.quadroRelatorio}>
          <Text style={styles.subtitulo}>Relatório de {alunoSelecionado.nome}</Text>
          <Text> Acessos: {alunoSelecionado.acessos}</Text>
          <Text> Tempo total: {alunoSelecionado.tempo}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, marginBottom: 5 },
  botao: { padding: 15, backgroundColor: '#ecf0f1', borderRadius: 5, marginBottom: 5 },
  botaoAtivo: { backgroundColor: '#bdc3c7', borderWidth: 1 },
  botaoAluno: { padding: 12, backgroundColor: '#f9f9f9', marginLeft: 15, borderLeftWidth: 3, borderLeftColor: '#3498db', marginBottom: 5 },
  secao: { marginTop: 20 },
  quadroRelatorio: { marginTop: 30, padding: 20, backgroundColor: '#e8f4fd', borderRadius: 10 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
});

export default RelatorioProfessor;