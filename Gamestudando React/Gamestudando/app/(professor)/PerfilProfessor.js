import React, { useCallback, useState } from 'react';
import { Alert, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { styles } from '../styles';
import { carregarPerfil } from '../utils/perfilAluno';
import { sairDaConta } from '../utils/authUsuario';

const PerfilProfessor = () => {
  const router = useRouter();
  const [perfil, setPerfil] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregar = async () => {
        const dados = await carregarPerfil();

        if (ativo) {
          setPerfil(dados);
        }
      };

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const deslogar = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja sair desta conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await sairDaConta();
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.portalContainer}>
      <Text style={styles.portalTitulo}>Perfil do Professor</Text>

      <Text style={styles.portalLabel}>Nome:</Text>
      <Text style={styles.portalValor}>{perfil.nome || 'Professor'}</Text>

      <Text style={styles.portalLabel}>E-mail:</Text>
      <Text style={styles.portalValor}>{perfil.email || 'Sem email'}</Text>

      <Text style={styles.portalLabel}>Tipo de conta:</Text>
      <Text style={styles.portalValor}>Professor</Text>

      <TouchableOpacity
        style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
        onPress={() => router.push('/EdicaoPerfilProfessor')}
      >
        <Text style={styles.textoBotao}>Editar perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
        onPress={() => router.push('/ListarTarefas')}
      >
        <Text style={styles.textoBotao}>Tarefas postadas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoSair, styles.botaoPerfilEspacado]}
        onPress={deslogar}
      >
        <Text style={styles.textoBotao}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PerfilProfessor;
