import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const RelatorioResponsavel = () => {
  // Dados de exemplo (imagine que isso vem do banco de dados)
  const [criancas] = useState([
    { id: '1', nome: 'Joãozinho', acessos: '15 dias', tempo: '10h', atividades: 'Quiz de História' },
    { id: '2', nome: 'Mariazinha', acessos: '12 dias', tempo: '08h', atividades: 'Exercícios de Química' },
  ]);

  const [selecionada, setSelecionada] = useState(null);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Relatórios dos Alunos</Text>
      
      {/* Lista das crianças */}
      <FlatList
        data={criancas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.botaoCrianca} 
            onPress={() => setSelecionada(item)}
          >
            <Text style={styles.nomeCrianca}>{item.nome}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Detalhes que aparecem ao clicar */}
      {selecionada && (
        <View style={styles.quadroDetalhes}>
          <Text style={styles.subtitulo}>Detalhes de {selecionada.nome}:</Text>
          <Text> Dias acessados: {selecionada.acessos}</Text>
          <Text> Tempo na plataforma: {selecionada.tempo}</Text>
          <Text> Última atividade: {selecionada.atividades}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  botaoCrianca: { padding: 15, backgroundColor: '#f0f0f0', marginBottom: 10, borderRadius: 8 },
  nomeCrianca: { fontSize: 18, color: '#333' },
  quadroDetalhes: { marginTop: 30, padding: 20, borderTopWidth: 1, borderColor: '#ccc' },
  subtitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }
});

export default RelatorioResponsavel;