import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';

const PerfilProfessor = () => {
  const professor = {
    nome: 'Carlos Eduardo Silva',
    email: 'carlos.silva@escola.com',
    turmas: [
      '5 Ano A',
      '6 Ano B',
      '7 Ano C'
    ]
  };

  return (
    <View style={styles.portalContainer}>
      <Text style={styles.portalTitulo}>Perfil do Professor</Text>

      <Text style={styles.portalLabel}>Nome:</Text>
      <Text style={styles.portalValor}>{professor.nome}</Text>

      <Text style={styles.portalLabel}>E-mail:</Text>
      <Text style={styles.portalValor}>{professor.email}</Text>

      <Text style={styles.portalLabel}>Turmas:</Text>
      {professor.turmas.map((turma, index) => (
        <Text key={index} style={styles.portalItemLista}>
          - {turma}
        </Text>
      ))}
    </View>
  );
};

export default PerfilProfessor;
