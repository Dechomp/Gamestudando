import { Picker } from '@react-native-picker/picker';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { styles } from '../styles';
import {
    criarQuestaoCosmoletrando,
    criarQuestaoMultiplaEscolhaProfessor,
    criarQuestaoRimaProfessor
} from '../utils/firebaseTarefas';

const CriarAtividade = ({ embutida = false }) => {
  const scrollRef = useRef(null);
  const [materia, setMateria] = useState('matematica');
  const [pergunta, setPergunta] = useState('');
  const [alternativas, setAlternativas] = useState(['', '', '', '']);
  const [alternativaCorreta, setAlternativaCorreta] = useState(null);
  const [nivel, setNivel] = useState('1');
  const [palavraA, setPalavraA] = useState('');
  const [palavraB, setPalavraB] = useState('');
  const [palavraMissao, setPalavraMissao] = useState('');
  const [cosmoPalavra, setCosmoPalavra] = useState('');
  const [salvando, setSalvando] = useState(false);

  const criandoRima = materia === 'rimas';
  const criandoCosmoletrando = materia === 'cosmoletrando';

  const rolarParaBaixo = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };

  const atualizarAlternativa = (texto, indice) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[indice] = texto;
    setAlternativas(novasAlternativas);
  };

  const salvarAtividade = async () => {
    try {
      setSalvando(true);

      if (criandoRima) {
        await salvarRima();
      } else if (criandoCosmoletrando) {
        await salvarCosmoletrando();
      } else {
        await salvarMultiplaEscolha();
      }

      Alert.alert(
        'Atividade enviada',
        'A atividade passou pela verificacao local e foi salva.'
      );

      limparFormulario();
    } catch (error) {
      console.log('Erro salvando atividade:', error);
      Alert.alert('Atividade', mensagemErro(error));
    } finally {
      setSalvando(false);
    }
  };

  const salvarMultiplaEscolha = async () => {
    if (!pergunta.trim()) {
      throw new Error('PERGUNTA_VAZIA');
    }

    const respostasLimpas = alternativas.map(alternativa =>
      alternativa.trim()
    );

    if (respostasLimpas.some(alternativa => !alternativa)) {
      throw new Error('ALTERNATIVA_VAZIA');
    }

    if (alternativaCorreta === null) {
      throw new Error('SEM_CORRETA');
    }

    await criarQuestaoMultiplaEscolhaProfessor({
      materia,
      pergunta,
      respostas: respostasLimpas,
      correta: alternativaCorreta,
      nivel
    });
  };

  const salvarRima = async () => {
    if (!palavraA.trim() || !palavraB.trim()) {
      throw new Error('RIMA_INCOMPLETA');
    }

    if (palavraA.trim().toLowerCase() === palavraB.trim().toLowerCase()) {
      throw new Error('RIMA_REPETIDA');
    }

    if (!parecemRimar(palavraA, palavraB)) {
      throw new Error('NAO_PARECE_RIMA');
    }

    await criarQuestaoRimaProfessor({
      palavraA,
      palavraB,
      palavraMissao,
      nivel
    });
  };

  const salvarCosmoletrando = async () => {
    if (!cosmoPalavra.trim()) {
      throw new Error('COSMOLETRANDO_VAZIO');
    }

    await criarQuestaoCosmoletrando({
      palavra: cosmoPalavra,
      nivel
    });
  };

  const limparFormulario = () => {
    setMateria('matematica');
    setPergunta('');
    setAlternativas(['', '', '', '']);
    setAlternativaCorreta(null);
    setNivel('1');
    setPalavraA('');
    setPalavraB('');
    setPalavraMissao('');
    setCosmoPalavra('');
  };

  const conteudo = (
    <>
      <Text style={styles.titulo}>Criar atividade</Text>

      <Text style={styles.label}>Materia</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={materia}
          onValueChange={(value) => setMateria(value)}
        >
          <Picker.Item label="Matematica" value="matematica" />
          <Picker.Item label="Portugues" value="portugues" />
          <Picker.Item label="Rimas" value="rimas" />
          <Picker.Item label="Cosmo Letrando" value="cosmoletrando" />
        </Picker>
      </View>

      {!criandoRima && !criandoCosmoletrando ? (
        <>
          <Text style={styles.label}>Pergunta</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Digite a pergunta"
            value={pergunta}
            onChangeText={setPergunta}
            multiline
            onFocus={rolarParaBaixo}
          />

          <Text style={styles.label}>Respostas</Text>
          {alternativas.map((alternativa, index) => (
            <View key={index} style={styles.linhaAlternativa}>
              <Text style={styles.letra}>
                {String.fromCharCode(65 + index)}:
              </Text>

              <TextInput
                style={styles.inputAlternativa}
                placeholder={`Alternativa ${String.fromCharCode(65 + index)}`}
                value={alternativa}
                onChangeText={(texto) => atualizarAlternativa(texto, index)}
                onFocus={rolarParaBaixo}
              />

              <Switch
                value={alternativaCorreta === index}
                onValueChange={() => setAlternativaCorreta(index)}
              />
            </View>
          ))}
        </>
      ) : criandoRima ? (
        <>
          <Text style={styles.label}>Primeira palavra</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: PATO"
            value={palavraA}
            onChangeText={setPalavraA}
            autoCapitalize="characters"
            onFocus={rolarParaBaixo}
          />

          <Text style={styles.label}>Palavra que rima</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: GATO"
            value={palavraB}
            onChangeText={setPalavraB}
            autoCapitalize="characters"
            onFocus={rolarParaBaixo}
          />
        </>
      ) : (
        <>
          <Text style={styles.label}>Palavra</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite a palavra"
            value={cosmoPalavra}
            onChangeText={setCosmoPalavra}
            autoCapitalize="characters"
            onFocus={rolarParaBaixo}
          />
        </>
      )}

      <Text style={styles.label}>Nivel de dificuldade</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nivel}
          onValueChange={(value) => setNivel(value)}
        >
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
          <Picker.Item label="5" value="5" />
          <Picker.Item label="6" value="6" />
        </Picker>
      </View>

      <TouchableOpacity
        style={[
          styles.botaoSalvar,
          salvando && styles.botaoDesabilitado
        ]}
        disabled={salvando}
        onPress={salvarAtividade}
      >
        <Text style={styles.textoBotao}>
          {salvando ? 'Salvando...' : 'Salvar atividade'}
        </Text>
      </TouchableOpacity>
    </>
  );

  if (embutida) {
    return conteudo;
  }

  return (
    <KeyboardAvoidingView
      style={styles.authKeyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.tarefaScroll}
        contentContainerStyle={styles.tarefaContent}
        keyboardShouldPersistTaps="handled"
      >
        {conteudo}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

function parecemRimar(palavraA, palavraB) {
  const a = normalizarPalavra(palavraA);
  const b = normalizarPalavra(palavraB);

  if (a.length < 2 || b.length < 2) return false;

  const finalA3 = a.slice(-3);
  const finalB3 = b.slice(-3);
  const finalA2 = a.slice(-2);
  const finalB2 = b.slice(-2);

  return finalA3 === finalB3 || finalA2 === finalB2;
}

function normalizarPalavra(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function mensagemErro(error) {
  if (error?.message === 'PERGUNTA_VAZIA') {
    return 'Digite a pergunta da atividade.';
  }

  if (error?.message === 'ALTERNATIVA_VAZIA') {
    return 'Preencha todas as alternativas.';
  }

  if (error?.message === 'SEM_CORRETA') {
    return 'Marque a resposta correta.';
  }

  if (error?.message === 'RIMA_INCOMPLETA') {
    return 'Preencha as duas palavras da rima.';
  }

  if (error?.message === 'RIMA_REPETIDA') {
    return 'Use duas palavras diferentes.';
  }

  if (error?.message === 'NAO_PARECE_RIMA') {
    return 'Essas palavras nao parecem rimar. Confira antes de enviar.';
  }

  if (error?.message === 'RIMA_DUPLICADA') {
    return 'Ja existe uma rima usando esse mesmo par de palavras.';
  }

  if (error?.message === 'COSMOLETRANDO_VAZIO') {
    return 'Digite a palavra para o Cosmo Letrando.';
  }

  if (error?.message === 'MODERACAO_LOCAL') {
    return error.motivo || 'A tarefa foi bloqueada pela verificacao local.';
  }

  return 'Nao foi possivel salvar a atividade agora.';
}

export default CriarAtividade;
