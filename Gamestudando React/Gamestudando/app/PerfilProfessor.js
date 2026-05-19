import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PerfilProfessor = () => {
  // Dados de exemplo
  const professor = {
    nome: 'Carlos Eduardo Silva',
    email: 'carlos.silva@escola.com',
    turmas: [
      '5º Ano A',
      '6º Ano B',
      '7º Ano C'
    ]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil do Professor</Text>

      <Text style={styles.label}>Nome:</Text>
      <Text style={styles.valor}>{professor.nome}</Text>

      <Text style={styles.label}>E-mail:</Text>
      <Text style={styles.valor}>{professor.email}</Text>

      <Text style={styles.label}>Turmas:</Text>
      {professor.turmas.map((turma, index) => (
        <Text key={index} style={styles.itemLista}>
          • {turma}
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

export default PerfilProfessor;