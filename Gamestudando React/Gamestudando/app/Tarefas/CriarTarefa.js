import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { styles } from '../styles';

const CriarTarefa = () => {
  // Lista de tarefas salvas localmente
  const [tarefas, setTarefas] = useState([]);

  // Tipo de tarefa selecionado
  const [tipoTarefa, setTipoTarefa] = useState('multipla');

  // === Múltipla Escolha ===
  const [disciplina, setDisciplina] = useState('Matemática');
  const [pergunta, setPergunta] = useState('');
  const [alternativas, setAlternativas] = useState(['', '', '', '']);
  const [alternativaCorreta, setAlternativaCorreta] = useState(null);
  const [nivel, setNivel] = useState('1');

  // === Rimas ===
  const [rimaPalavraEsquerda, setRimaPalavraEsquerda] = useState('');
  const [rimaPalavraDireita, setRimaPalavraDireita] = useState('');
  const [rimaGrupo, setRimaGrupo] = useState('1');
  const [rimaNivel, setRimaNivel] = useState('1');
  const [paresRimas, setParesRimas] = useState([]);

  // === Cosmoletrando ===
  const [cosmoPalavra, setCosmoPalavra] = useState('');
  const [cosmoLetra, setCosmoletra] = useState('');
  const [cosmoNivel, setCosmoNivel] = useState('1');
  const [cosmoPalavras, setCosmoPalavras] = useState([]);


  // Atualiza o texto de uma alternativa
  const atualizarAlternativa = (texto, indice) => {
    const novasAlternativas = [...alternativas];
    novasAlternativas[indice] = texto;
    setAlternativas(novasAlternativas);
  };

  // === Funções para Múltipla Escolha ===
  const salvarMultiplaEscolha = async () => {
    console.log('Iniciando validação de múltipla escolha...');

    // Validação da pergunta
    if (pergunta.trim() === '') {
      console.log('Pergunta vazia');
      window.alert('Por favor, digite a pergunta da tarefa.');
      return;
    }

    // Validação das alternativas
    for (let i = 0; i < alternativas.length; i++) {
      if (alternativas[i].trim() === '') {
        console.log(`Alternativa ${i} vazia`);
        window.alert(
          `Por favor, preencha a alternativa ${String.fromCharCode(65 + i)}.`
        );
        return;
      }
    }

    // Validação da alternativa correta
    if (alternativaCorreta === null) {
      console.log('Nenhuma alternativa correta selecionada');
      window.alert(
        'Por favor, escolha qual alternativa é a resposta correta.'
      );
      return;
    }

    // Cria o objeto da tarefa
    const novaTarefa = {
      id: Date.now().toString(),
      tipo: 'multipla',
      disciplina,
      pergunta,
      alternativas,
      alternativaCorreta,
      nivel,
    };

    try {
      // Busca tarefas já salvas
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');

      // Converte para array ou cria array vazio
      const tarefasExistentes = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];

      // Adiciona a nova tarefa
      const novasTarefas = [...tarefasExistentes, novaTarefa];

      // Salva novamente no AsyncStorage
      await AsyncStorage.setItem(
        'tarefas',
        JSON.stringify(novasTarefas)
      );

      // Atualiza o contador local
      setTarefas(novasTarefas);

      // Mensagem de sucesso
      window.alert('Tarefa de múltipla escolha salva com sucesso!');

      // Limpa o formulário
      setDisciplina('Matemática');
      setPergunta('');
      setAlternativas(['', '', '', '']);
      setAlternativaCorreta(null);
      setNivel('1');

      // Mostra no console
      console.log('Tarefa salva:', novaTarefa);
    } catch (error) {
      window.alert('Não foi possível salvar a tarefa.');
      console.log('Erro ao salvar tarefa:', error);
    }
  };

  // === Funções para Rimas ===
  const adicionarRima = () => {
    if (!rimaPalavraEsquerda.trim() || !rimaPalavraDireita.trim()) {
      window.alert('Por favor, preencha ambas as palavras da rima.');
      return;
    }

    const novaRima = {
      id: Date.now().toString(),
      esquerda: rimaPalavraEsquerda,
      direita: rimaPalavraDireita,
      grupo: rimaGrupo,
      nivel: rimaNivel,
    };

    setParesRimas([...paresRimas, novaRima]);
    setRimaPalavraEsquerda('');
    setRimaPalavraDireita('');
  };

  const salvarRimas = async () => {
    if (paresRimas.length === 0) {
      window.alert('Por favor, adicione pelo menos um par de rimas.');
      return;
    }

    const novaTarefa = {
      id: Date.now().toString(),
      tipo: 'rimas',
      pares: paresRimas,
    };

    try {
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');
      const tarefasExistentes = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];

      const novasTarefas = [...tarefasExistentes, novaTarefa];

      await AsyncStorage.setItem(
        'tarefas',
        JSON.stringify(novasTarefas)
      );

      setTarefas(novasTarefas);

      window.alert('Rimas salvas com sucesso!');

      setParesRimas([]);
      setRimaPalavraEsquerda('');
      setRimaPalavraDireita('');
      setRimaGrupo('1');
      setRimaNivel('1');

      console.log('Rimas salvas:', novaTarefa);
    } catch (error) {
      window.alert('Não foi possível salvar as rimas.');
      console.log('Erro ao salvar rimas:', error);
    }
  };

  const removerRima = (id) => {
    setParesRimas(paresRimas.filter(rima => rima.id !== id));
  };

  // === Funções para Cosmoletrando ===
  const adicionarCosmoPalavra = () => {
    if (!cosmoPalavra.trim() || !cosmoLetra.trim()) {
      window.alert('Por favor, preencha a palavra e a letra inicial.');
      return;
    }

    if (cosmoLetra.length > 1) {
      window.alert('A letra inicial deve conter apenas um caractere.');
      return;
    }

    const novaPalavra = {
      id: Date.now().toString(),
      palavra: cosmoPalavra,
      letraInicial: cosmoLetra.toUpperCase(),
      nivel: cosmoNivel,
    };

    setCosmoPalavras([...cosmoPalavras, novaPalavra]);
    setCosmoPalavra('');
    setCosmoletra('');
  };

  const salvarCosmoPalavras = async () => {
    if (cosmoPalavras.length === 0) {
      window.alert('Por favor, adicione pelo menos uma palavra para Cosmoletrando.');
      return;
    }

    const novaTarefa = {
      id: Date.now().toString(),
      tipo: 'cosmoletrando',
      palavras: cosmoPalavras,
    };

    try {
      const tarefasSalvas = await AsyncStorage.getItem('tarefas');
      const tarefasExistentes = tarefasSalvas
        ? JSON.parse(tarefasSalvas)
        : [];

      const novasTarefas = [...tarefasExistentes, novaTarefa];

      await AsyncStorage.setItem(
        'tarefas',
        JSON.stringify(novasTarefas)
      );

      setTarefas(novasTarefas);

      window.alert('Palavras Cosmoletrando salvas com sucesso!');

      setCosmoPalavras([]);
      setCosmoPalavra('');
      setCosmoletra('');
      setCosmoNivel('1');

      console.log('Cosmoletrando salvo:', novaTarefa);
    } catch (error) {
      window.alert('Não foi possível salvar as palavras Cosmoletrando.');
      console.log('Erro ao salvar Cosmoletrando:', error);
    }
  };

  const removerCosmoPalavra = (id) => {
    setCosmoPalavras(cosmoPalavras.filter(palavra => palavra.id !== id));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Criar Tarefa</Text>

      {/* Seleção de Tipo de Tarefa */}
      <Text style={styles.label}>Tipo de Tarefa</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={tipoTarefa}
          onValueChange={(itemValue) => setTipoTarefa(itemValue)}
        >
          <Picker.Item label="Múltipla Escolha" value="multipla" />
          <Picker.Item label="Rimas" value="rimas" />
          <Picker.Item label="Cosmoletrando" value="cosmoletrando" />
        </Picker>
      </View>

      {/* === Formulário: Múltipla Escolha === */}
      {tipoTarefa === 'multipla' && (
        <>
          {/* Disciplina */}
          <Text style={styles.label}>Disciplina</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={disciplina}
              onValueChange={(itemValue) => setDisciplina(itemValue)}
            >
              <Picker.Item label="Matemática" value="Matemática" />
              <Picker.Item label="Português" value="Português" />
            </Picker>
          </View>

          {/* Pergunta */}
          <Text style={styles.label}>Pergunta</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Digite a pergunta"
            value={pergunta}
            onChangeText={setPergunta}
            multiline
          />

          {/* Alternativas */}
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
                onChangeText={(texto) =>
                  atualizarAlternativa(texto, index)
                }
              />

              <Switch
                value={alternativaCorreta === index}
                onValueChange={() => setAlternativaCorreta(index)}
              />
            </View>
          ))}

          {/* Nível de dificuldade */}
          <Text style={styles.label}>Nível de Dificuldade</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={nivel}
              onValueChange={(itemValue) => setNivel(itemValue)}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>

          {/* Botão Salvar */}
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={salvarMultiplaEscolha}
          >
            <Text style={styles.textoBotao}>Salvar Tarefa</Text>
          </TouchableOpacity>
        </>
      )}

      {/* === Formulário: Rimas === */}
      {tipoTarefa === 'rimas' && (
        <>
          <Text style={styles.label}>Adicionar Par de Rimas</Text>

          {/* Palavra Esquerda */}
          <Text style={styles.sublabel}>Palavra 1</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Digite a primeira palavra"
            value={rimaPalavraEsquerda}
            onChangeText={setRimaPalavraEsquerda}
          />

          {/* Palavra Direita */}
          <Text style={styles.sublabel}>Palavra 2</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Digite a segunda palavra"
            value={rimaPalavraDireita}
            onChangeText={setRimaPalavraDireita}
          />

          {/* Grupo */}
          <Text style={styles.label}>Grupo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rimaGrupo}
              onValueChange={(itemValue) => setRimaGrupo(itemValue)}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
            </Picker>
          </View>

          {/* Nível */}
          <Text style={styles.label}>Nível</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={rimaNivel}
              onValueChange={(itemValue) => setRimaNivel(itemValue)}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
            </Picker>
          </View>

          {/* Botão Adicionar */}
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={adicionarRima}
          >
            <Text style={styles.textoBotao}>Adicionar Rima</Text>
          </TouchableOpacity>

          {/* Lista de Rimas */}
          {paresRimas.length > 0 && (
            <>
              <Text style={styles.label}>Rimas Adicionadas ({paresRimas.length})</Text>
              {paresRimas.map((rima) => (
                <View key={rima.id} style={styles.itemLista}>
                  <Text style={styles.textoLista}>
                    {rima.esquerda} - {rima.direita} (Grupo {rima.grupo}, Nível {rima.nivel})
                  </Text>
                  <TouchableOpacity onPress={() => removerRima(rima.id)}>
                    <Text style={styles.textoRemover}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Botão Salvar Rimas */}
          <TouchableOpacity
            style={styles.botaoFinalizar}
            onPress={salvarRimas}
          >
            <Text style={styles.textoBotao}>Salvar Rimas</Text>
          </TouchableOpacity>
        </>
      )}

      {/* === Formulário: Cosmoletrando === */}
      {tipoTarefa === 'cosmoletrando' && (
        <>
          <Text style={styles.label}>Adicionar Palavra Cosmoletrando</Text>

          {/* Palavra */}
          <Text style={styles.sublabel}>Palavra</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Digite a palavra"
            value={cosmoPalavra}
            onChangeText={setCosmoPalavra}
          />

          {/* Letra Inicial */}
          <Text style={styles.sublabel}>Letra Inicial</Text>
          <TextInput
            style={styles.inputPergunta}
            placeholder="Letra inicial (um caractere)"
            value={cosmoLetra}
            onChangeText={setCosmoletra}
            maxLength={1}
          />

          {/* Nível */}
          <Text style={styles.label}>Nível</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cosmoNivel}
              onValueChange={(itemValue) => setCosmoNivel(itemValue)}
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
            </Picker>
          </View>

          {/* Botão Adicionar */}
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={adicionarCosmoPalavra}
          >
            <Text style={styles.textoBotao}>Adicionar Palavra</Text>
          </TouchableOpacity>

          {/* Lista de Palavras */}
          {cosmoPalavras.length > 0 && (
            <>
              <Text style={styles.label}>Palavras Adicionadas ({cosmoPalavras.length})</Text>
              {cosmoPalavras.map((palavra) => (
                <View key={palavra.id} style={styles.itemLista}>
                  <Text style={styles.textoLista}>
                    {palavra.palavra} (letra: {palavra.letraInicial}, nível: {palavra.nivel})
                  </Text>
                  <TouchableOpacity onPress={() => removerCosmoPalavra(palavra.id)}>
                    <Text style={styles.textoRemover}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Botão Salvar */}
          <TouchableOpacity
            style={styles.botaoFinalizar}
            onPress={salvarCosmoPalavras}
          >
            <Text style={styles.textoBotao}>Salvar Cosmoletrando</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Contador */}
      <Text style={styles.contador}>
        Tarefas salvas localmente: {tarefas.length}
      </Text>
    </ScrollView>
  );
};


export default CriarTarefa;
