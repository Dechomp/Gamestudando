import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { styles } from '../styles';

const RelatorioResponsavel = () => {
  const [criancas] = useState([
    { id: '1', nome: 'Joaozinho', acessos: '15 dias', tempo: '10h', atividades: 'Quiz de Historia' },
    { id: '2', nome: 'Mariazinha', acessos: '12 dias', tempo: '08h', atividades: 'Exercicios de Quimica' },
  ]);

  const [selecionada, setSelecionada] = useState(null);

  return (
    <View style={styles.portalContainer}>
      <Text style={styles.portalTituloMenor}>Relatorios dos Alunos</Text>

      <FlatList
        data={criancas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.portalBotaoCrianca}
            onPress={() => setSelecionada(item)}
          >
            <Text style={styles.portalNomeCrianca}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />

      {selecionada && (
        <View style={styles.portalQuadroDetalhes}>
          <Text style={styles.portalSubtitulo}>
            Detalhes de {selecionada.nome}:
          </Text>
          <Text>Dias acessados: {selecionada.acessos}</Text>
          <Text>Tempo na plataforma: {selecionada.tempo}</Text>
          <Text>Ultima atividade: {selecionada.atividades}</Text>
        </View>
      )}
    </View>
  );
};

export default RelatorioResponsavel;
