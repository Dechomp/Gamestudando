import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { styles } from '../styles';
import {
  criarTurmaProfessor,
  montarValorQrTurma,
} from '../utils/firebaseTurmas';

const CriarTurma = () => {
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [turmaCriada, setTurmaCriada] = useState(null);

  const criarTurma = async () => {
    if (salvando) return;

    try {
      setSalvando(true);
      const turma = await criarTurmaProfessor({ nome });
      setTurmaCriada(turma);
      setNome('');

      Alert.alert(
        'Turma criada',
        'Compartilhe o codigo ou QR Code com os alunos.'
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Turma', mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View>
      <Text style={styles.titulo}>Criar turma</Text>

      <Text style={styles.label}>Nome da turma</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: 1 Ano A"
      />

      <TouchableOpacity
        style={[
          styles.botaoSalvar,
          salvando && styles.botaoDesabilitado,
        ]}
        disabled={salvando}
        onPress={criarTurma}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Criando...' : 'Criar turma'}
        </Text>
      </TouchableOpacity>

      {turmaCriada && (
        <View style={styles.turmaQrCard}>
          <Text style={styles.portalSubtitulo}>{turmaCriada.nome}</Text>
          <Text style={styles.turmaCodigo}>{turmaCriada.codigo}</Text>

          <View style={styles.turmaQrBox}>
            <QRCode
              value={montarValorQrTurma(turmaCriada.codigo)}
              size={190}
            />
          </View>

          <Text style={styles.legendaTexto}>
            Codigo para vincular alunos a esta turma.
          </Text>
        </View>
      )}
    </View>
  );
};

function mensagemErro(error) {
  if (error?.message === 'NOME_TURMA_CURTO') {
    return 'Digite um nome de turma com pelo menos 3 caracteres.';
  }

  if (error?.message === 'CODIGO_TURMA_INDISPONIVEL') {
    return 'Nao foi possivel gerar um codigo agora. Tente novamente.';
  }

  return 'Nao foi possivel criar a turma agora.';
}

export default CriarTurma;
