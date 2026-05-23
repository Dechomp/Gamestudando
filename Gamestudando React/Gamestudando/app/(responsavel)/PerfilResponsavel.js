import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

const PerfilResponsavel = () => {
  const responsavel = {
    nome: 'Maria Aparecida Souza',
    email: 'maria.souza@email.com',
    alunos: [
      'Joao Souza',
      'Ana Souza'
    ]
  };

  return (
    <View style={styles.portalContainer}>
      <Text style={styles.portalTitulo}>Perfil do Responsavel</Text>

      <Text style={styles.portalLabel}>Nome:</Text>
      <Text style={styles.portalValor}>{responsavel.nome}</Text>

      <Text style={styles.portalLabel}>E-mail:</Text>
      <Text style={styles.portalValor}>{responsavel.email}</Text>

      <Text style={styles.portalLabel}>Alunos responsaveis:</Text>
      {responsavel.alunos.map((aluno, index) => (
        <Text key={index} style={styles.portalItemLista}>
          - {aluno}
        </Text>
      ))}
    </View>
  );
};

export default PerfilResponsavel;
