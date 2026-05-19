import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PerfilResponsavel = () => {
  // Dados de exemplo
  const responsavel = {
    nome: 'Maria Aparecida Souza',
    email: 'maria.souza@email.com',
    alunos: [
      'João Souza',
      'Ana Souza'
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil do Responsável</Text>

      <Text style={styles.label}>Nome:</Text>
      <Text style={styles.valor}>{responsavel.nome}</Text>

      <Text style={styles.label}>E-mail:</Text>
      <Text style={styles.valor}>{responsavel.email}</Text>

      <Text style={styles.label}>Alunos Responsáveis:</Text>
      {responsavel.alunos.map((aluno, index) => (
        <Text key={index} style={styles.itemLista}>
          • {aluno}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#333',
  },
  valor: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  itemLista: {
    fontSize: 17,
    color: '#555',
    marginTop: 5,
    marginLeft: 10,
  },
});

export default PerfilResponsavel;