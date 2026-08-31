import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Picker } from '@react-native-picker/picker';

import { styles } from '../styles';
import {
  criarTurmaProfessor,
  montarValorQrTurma,
} from '../utils/firebaseTurmas';

const CriarTurma = () => {
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('regular');
  const [salvando, setSalvando] = useState(false);
  const [turmaCriada, setTurmaCriada] = useState(null);

  const criarTurma = async () => {
    if (salvando) return;

    try {
      setSalvando(true);
      const turma = await criarTurmaProfessor({ nome, tipo });
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

      <Text style={styles.label}>Tipo de turma</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={tipo} onValueChange={setTipo}>
          <Picker.Item label="Regular — Português e Matemática" value="regular" />
          <Picker.Item label="Maker — ferramentas e trilha Maker" value="maker" />
          <Picker.Item label="Mista — Regular e Maker" value="mista" />
        </Picker>
      </View>

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
          <Text style={styles.legendaTexto}>Turma {nomeTipoTurma(turmaCriada.tipo)}</Text>
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

  if (error?.message === 'TIPO_TURMA_INVALIDO') {
    return 'Escolha um tipo de turma válido.';
  }

  if (error?.code === 'permission-denied') {
    return 'Sem permissão para criar a turma. Entre novamente na conta de professor e tente de novo.';
  }

  return 'Nao foi possivel criar a turma agora.';
}

function nomeTipoTurma(tipo) {
  if (tipo === 'maker') return 'Maker';
  if (tipo === 'mista') return 'Mista';
  return 'Regular';
}

export default CriarTurma;
