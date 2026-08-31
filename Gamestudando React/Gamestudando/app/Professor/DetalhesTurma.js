import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';

import { styles } from '../styles';
import { colors } from '../colors';
import {
  adicionarAlunoNaTurmaPorCodigo,
  atualizarTurmaProfessor,
  excluirTurmaProfessor,
  obterTurmaProfessor,
  removerAlunoDaTurma,
} from '../utils/firebaseTurmas';

const DetalhesTurma = () => {
  const params = useLocalSearchParams();
  // Aceita tanto a rota antiga (?id=) quanto os atalhos novos (?turmaId=).
  const turmaId = valorParam(params.id || params.turmaId);
  const [turma, setTurma] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  const [editando, setEditando] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [codigoAluno, setCodigoAluno] = useState('');
  const [nivelMakerInicial, setNivelMakerInicial] = useState('1');
  const [makerCoinsIniciais, setMakerCoinsIniciais] = useState('0');
  const [vinculandoAluno, setVinculandoAluno] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('nome');
  const [ordem, setOrdem] = useState('asc');

  const resumoTurma = useMemo(
    () => turma ? calcularResumoTurma(turma) : null,
    [turma]
  );

  const carregar = useCallback(async () => {
    const dados = await obterTurmaProfessor(turmaId);
    setTurma(dados);
    setNomeEditado(dados.nome || '');
    setAlunoSelecionado((alunoAtual) =>
      alunoAtual
        ? dados.alunos.find((aluno) => aluno.id === alunoAtual.id) || null
        : null
    );
  }, [turmaId]);

  useFocusEffect(
    useCallback(() => {
      carregar().catch((error) => {
        console.log(error);
        Alert.alert('Turma', 'Nao foi possivel carregar a turma.');
      });

      return () => {
        setEditando(false);
        setNomeEditado('');
      };
    }, [carregar])
  );

  const alunosOrdenados = useMemo(() => {
    const alunos = [...(turma?.alunos || [])];

    alunos.sort((a, b) => {
      const direcao = ordem === 'asc' ? 1 : -1;

      if (ordenarPor === 'atividades') {
        return ((a.atividadesConcluidas || 0) - (b.atividadesConcluidas || 0)) * direcao;
      }

      if (ordenarPor === 'entrada') {
        return (dataAluno(a) - dataAluno(b)) * direcao;
      }

      return String(a.nome || '').localeCompare(String(b.nome || '')) * direcao;
    });

    return alunos;
  }, [ordem, ordenarPor, turma]);

  const salvarNome = async () => {
    try {
      await atualizarTurmaProfessor(turmaId, { nome: nomeEditado });
      setEditando(false);
      await carregar();
      Alert.alert('Turma', 'Nome da turma atualizado.');
    } catch (error) {
      console.log(error);
      Alert.alert('Turma', 'Nao foi possivel editar a turma.');
    }
  };

  const confirmarExcluirTurma = () => {
    Alert.alert(
      'Excluir turma',
      'Deseja excluir esta turma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await excluirTurmaProfessor(turmaId);
            router.replace('/Professor/RelatorioProfessor');
          },
        },
      ]
    );
  };

  const confirmarRemoverAluno = (aluno) => {
    Alert.alert(
      'Remover aluno',
      `Deseja remover ${aluno.nome || 'este aluno'} da turma?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removerAlunoDaTurma(turmaId, aluno.id);
            setAlunoSelecionado(null);
            await carregar();
          },
        },
      ]
    );
  };

  const adicionarAlunoPorCodigo = async (valorCodigo = codigoAluno) => {
    if (vinculandoAluno) return;

    try {
      setVinculandoAluno(true);
      await adicionarAlunoNaTurmaPorCodigo(turmaId, valorCodigo, {
        nivelAtual: nivelMakerInicial,
        moedasAtuais: makerCoinsIniciais,
      });
      setCodigoAluno('');
      setNivelMakerInicial('1');
      setMakerCoinsIniciais('0');
      await carregar();
      Alert.alert('Turma', 'Aluno adicionado a turma.');
    } catch (error) {
      console.log(error);
      Alert.alert('Turma', mensagemErroAdicionarAluno(error));
    } finally {
      setVinculandoAluno(false);
    }
  };

  if (!turma) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando turma...</Text>
      </View>
    );
  }

  const temMaker = turma.tipo !== 'regular';
  const materiasDoGrafico = materiasDaTurma(turma.tipo);

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
    >
      <TouchableOpacity
        style={styles.botaoVoltarTarefa}
        onPress={() => {
          setEditando(false);
          router.back();
        }}
      >
        <Text style={styles.textoVoltarTarefa}>{"<-"} Voltar</Text>
      </TouchableOpacity>

      {editando ? (
        <View>
          <Text style={styles.label}>Nome da turma</Text>
          <TextInput
            style={styles.input}
            value={nomeEditado}
            onChangeText={setNomeEditado}
          />

          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarNome}>
            <Text style={styles.textoBotao}>Salvar nome</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.portalTituloMenor}>{turma.nome}</Text>
          <Text style={styles.portalValor}>Codigo: {turma.codigo}</Text>
          <Text style={styles.legendaTexto}>Turma {nomeTipoTurma(turma.tipo)}</Text>
        </>
      )}

      <View style={styles.linhaAcoes}>
        <TouchableOpacity
          style={[styles.botaoEditar, styles.botaoAcaoFlex]}
          onPress={() => setEditando(!editando)}
        >
          <Text style={styles.textoBotao}>{editando ? 'Cancelar' : 'Editar'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSair, styles.botaoAcaoFlex]}
          onPress={confirmarExcluirTurma}
        >
          <Text style={styles.textoBotao}>Excluir</Text>
        </TouchableOpacity>
      </View>

      {temMaker && <View style={styles.portalQuadroRelatorio}>
        <Text style={styles.portalSubtitulo}>Ferramentas da Sala Maker</Text>
        <Text style={styles.legendaTexto}>
          Escolha o que deseja fazer nesta turma.
        </Text>
        <View style={styles.turmaMakerAcoes}>
          <TouchableOpacity style={[styles.turmaMakerAcao, styles.turmaMakerAcaoPresenca]} onPress={() => router.push({ pathname: '/Professor/ChamadaMaker', params: { turmaId } })}>
            <Text style={styles.turmaMakerAcaoTitulo}>✓ Fazer chamada</Text>
            <Text style={styles.turmaMakerAcaoDescricao}>Registrar presença, ajudante e recompensas da aula.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.turmaMakerAcao, styles.turmaMakerAcaoGestao]} onPress={() => router.push({ pathname: '/Professor/GestaoMaker', params: { turmaId } })}>
            <Text style={styles.turmaMakerAcaoTitulo}>⚙ Administrar Sala Maker</Text>
            <Text style={styles.turmaMakerAcaoDescricao}>Loja, regras, observações, multas e pedidos.</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.turmaMakerAcao, styles.turmaMakerAcaoDinamicas]} onPress={() => router.push({ pathname: '/Professor/DinamicasMaker', params: { turmaId } })}>
            <Text style={styles.turmaMakerAcaoTitulo}>🎲 Roletas e curiosidades</Text>
            <Text style={styles.turmaMakerAcaoDescricao}>Sortear quem traz a curiosidade e criar outras roletas.</Text>
          </TouchableOpacity>
        </View>
      </View>}

      {resumoTurma && (
        <View style={styles.portalQuadroRelatorio}>
          <Text style={styles.portalSubtitulo}>Desempenho da turma</Text>

          <View style={styles.portalSecao}>
            {materiasDoGrafico.map((materia) => (
              <View key={materia} style={styles.relatorioMateriaLinha}>
                <Text style={styles.configuracaoTexto}>{nomeMateria(materia)}</Text>
                <View style={styles.graficoContainer}>
                  <PieChart
                    data={gerarDadosPizzaResumo(resumoTurma[materia])}
                    donut
                    radius={45}
                    innerRadius={28}
                    centerLabelComponent={() => (
                      <Text style={styles.textoPequeno}>
                        {resumoTurma[materia].percentual}%
                      </Text>
                    )}
                  />
                </View>
                <Text style={styles.legendaTexto}>
                  {resumoTurma[materia].percentual}% de acerto
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.portalValor}>
            Maior dificuldade: {resumoTurma.dificuldade}
          </Text>
          <Text style={styles.portalValor}>
            Recomendacao: {resumoTurma.recomendacao}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Ordenar alunos</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={ordenarPor} onValueChange={setOrdenarPor}>
          <Picker.Item label="Nome" value="nome" />
          <Picker.Item label="Quantidade de atividades" value="atividades" />
          <Picker.Item label="Dia que entrou" value="entrada" />
        </Picker>
      </View>

      <View style={styles.pickerContainerEspacado}>
        <Picker selectedValue={ordem} onValueChange={setOrdem}>
          <Picker.Item label="Crescente" value="asc" />
          <Picker.Item label="Decrescente" value="desc" />
        </Picker>
      </View>

      <View style={styles.portalQuadroRelatorio}>
        <Text style={styles.portalSubtitulo}>Adicionar aluno por codigo</Text>
        <TextInput
          style={styles.input}
          value={codigoAluno}
          onChangeText={(texto) => setCodigoAluno(texto.toUpperCase())}
          placeholder="Codigo do aluno"
          autoCapitalize="characters"
        />
        {temMaker && <><Text style={styles.legendaTexto}>
          Para Aluno Maker: informe o saldo atual trazido do formulário externo.
        </Text>
        <TextInput
          style={styles.input}
          value={nivelMakerInicial}
          onChangeText={setNivelMakerInicial}
          keyboardType="numeric"
          placeholder="Nível atual (mínimo 1)"
        />
        <TextInput
          style={styles.input}
          value={makerCoinsIniciais}
          onChangeText={setMakerCoinsIniciais}
          keyboardType="numeric"
          placeholder="Maker Coins atuais"
        /></>}

        <TouchableOpacity
          style={[styles.botaoSalvar, vinculandoAluno && styles.botaoDesabilitado]}
          disabled={vinculandoAluno || !codigoAluno.trim()}
          onPress={() => adicionarAlunoPorCodigo()}
        >
          <Text style={styles.textoBotao}>
            {vinculandoAluno ? 'Adicionando...' : 'Adicionar aluno'}
          </Text>
        </TouchableOpacity>

        {temMaker && <TouchableOpacity
          style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
          onPress={() => router.push({ pathname: '/Professor/LeitorQrAlunoTurma', params: { turmaId, nivel: nivelMakerInicial, moedas: makerCoinsIniciais } })}
        >
          <Text style={styles.textoBotao}>
            Ler QR Code do aluno
          </Text>
        </TouchableOpacity>}

      </View>

      <Text style={styles.label}>Alunos</Text>
      {alunosOrdenados.length === 0 ? (
        <Text style={styles.contador}>Nenhum aluno vinculado ainda.</Text>
      ) : (
        alunosOrdenados.map((aluno) => (
          <TouchableOpacity
            key={aluno.id}
            style={[
              styles.portalBotaoAluno,
              alunoSelecionado?.id === aluno.id && styles.portalBotaoAtivo,
            ]}
            onPress={() => {
              setAlunoSelecionado((atual) =>
                atual?.id === aluno.id ? null : aluno
              );
            }}
          >
            <Text style={styles.portalNomeCrianca}>{aluno.nome || 'Aluno'}</Text>
            <Text style={styles.legendaTexto}>
              Atividades: {aluno.atividadesConcluidas || 0}
            </Text>
          </TouchableOpacity>
        ))
      )}

      {alunoSelecionado && (
        <View style={styles.portalQuadroRelatorio}>
          <Text style={styles.portalSubtitulo}>
            {alunoSelecionado.nome || 'Aluno'}
          </Text>

          <Text style={styles.portalValor}>
            Dificuldade principal: {calcularDificuldade(alunoSelecionado, materiasDoGrafico)}
          </Text>
          <Text style={styles.portalValor}>
            Recomendacao de tarefa: {recomendarTema(alunoSelecionado, materiasDoGrafico)}
          </Text>

          <View style={styles.portalSecao}>
            {materiasDoGrafico.map((materia) => (
              <View key={materia} style={styles.relatorioMateriaLinha}>
                <Text style={styles.configuracaoTexto}>{nomeMateria(materia)}</Text>
                <View style={styles.graficoContainer}>
                  <PieChart
                    data={gerarDadosPizza(alunoSelecionado, materia)}
                    donut
                    radius={45}
                    innerRadius={28}
                    centerLabelComponent={() => (
                      <Text style={styles.textoPequeno}>
                        {calcularPercentual(alunoSelecionado, materia)}%
                      </Text>
                    )}
                  />
                </View>
                <Text style={styles.legendaTexto}>
                  {calcularPercentual(alunoSelecionado, materia)}% de acerto
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.botaoExcluirTarefa}
            onPress={() => confirmarRemoverAluno(alunoSelecionado)}
          >
            <Text style={styles.textoBotao}>Remover aluno da turma</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

function valorParam(valor) {
  if (Array.isArray(valor)) return valor[0] || '';
  return valor || '';
}

function dataAluno(aluno) {
  return aluno.entrouEm?.seconds || 0;
}

function gerarDadosPizza(aluno, materia) {
  const dados = obterDadosMateria(aluno, materia);

  return [
    { value: dados.acertos || 0, color: colors.certa },
    { value: dados.erros || 0, color: colors.errada },
  ];
}

function gerarDadosPizzaResumo(dados) {
  return [
    { value: dados.acertos || 0, color: colors.certa },
    { value: dados.erros || 0, color: colors.errada },
  ];
}

function calcularResumoTurma(turma) {
  const materias = materiasDaTurma(turma.tipo);
  const resumo = materias.reduce((acc, materia) => ({
    ...acc,
    [materia]: somarMateria(turma.alunos || [], materia),
  }), {});
  const piorMateria = materias
    .map((materia) => ({ materia, percentual: resumo[materia].percentual }))
    .sort((a, b) => a.percentual - b.percentual)[0]?.materia || materias[0];

  return {
    ...resumo,
    dificuldade: nomeMateria(piorMateria),
    recomendacao: recomendacaoParaMateria(piorMateria),
  };
}

function somarMateria(alunos, materia) {
  const totais = alunos.reduce(
    (acc, aluno) => {
      const dados = obterDadosMateria(aluno, materia);
      acc.acertos += dados.acertos || 0;
      acc.erros += dados.erros || 0;
      return acc;
    },
    { acertos: 0, erros: 0 }
  );
  const total = totais.acertos + totais.erros;

  return {
    ...totais,
    percentual: total ? Math.round((totais.acertos / total) * 100) : 0,
  };
}

function calcularPercentual(aluno, materia) {
  const dados = obterDadosMateria(aluno, materia);
  const acertos = dados.acertos || 0;
  const erros = dados.erros || 0;
  const total = acertos + erros;

  if (!total) return 0;

  return Math.round((acertos / total) * 100);
}

function calcularDificuldade(aluno, materias = ['matematica', 'portugues']) {
  const pior = materias
    .map((materia) => ({
      materia,
      percentual: calcularPercentual(aluno, materia),
    }))
    .sort((a, b) => a.percentual - b.percentual)[0];

  return nomeMateria(pior?.materia || 'matematica');
}

function recomendarTema(aluno, materias) {
  const dificuldade = calcularDificuldade(aluno, materias);
  return recomendacaoParaMateria(dificuldade.toLowerCase());
}

function obterDadosMateria(aluno, materia) {
  if (materia !== 'portugues') {
    return aluno.materias?.[materia] || {};
  }

  const portugues = aluno.materias?.portugues || {};
  const rimas = aluno.materias?.rimas || {};

  return {
    acertos: (portugues.acertos || 0) + (rimas.acertos || 0),
    erros: (portugues.erros || 0) + (rimas.erros || 0),
    atividadesConcluidas:
      (portugues.atividadesConcluidas || 0) +
      (rimas.atividadesConcluidas || 0),
  };
}

function nomeMateria(materia) {
  if (materia === 'matematica') return 'Matematica';
  if (materia === 'portugues') return 'Portugues';
  if (materia === 'rimas') return 'Rimas';
  if (materia === 'maker') return 'Maker';
  return materia;
}

function materiasDaTurma(tipo) {
  if (tipo === 'maker') return ['maker'];
  if (tipo === 'mista') return ['matematica', 'portugues', 'maker'];
  return ['matematica', 'portugues'];
}

function recomendacaoParaMateria(materia) {
  if (materia === 'portugues') return 'silabas, leitura de palavras e rimas';
  if (materia === 'maker') return 'robótica, sensores, Arduino e projetos práticos';
  return 'contas simples e comparacao de numeros';
}

function nomeTipoTurma(tipo) {
  if (tipo === 'maker') return 'Maker';
  if (tipo === 'mista') return 'Mista';
  return 'Regular';
}

function mensagemErroAdicionarAluno(error) {
  if (error?.message === 'CODIGO_ALUNO_VAZIO') {
    return 'Digite o codigo do aluno.';
  }

  if (error?.message === 'ALUNO_NAO_ENCONTRADO') {
    return 'Nao encontramos um aluno ativo com esse codigo.';
  }

  if (error?.message === 'SALDO_MAKER_INVALIDO') {
    return 'Informe nível a partir de 1 e Maker Coins iguais ou maiores que zero.';
  }

  if (error?.message === 'TURMA_APENAS_MAKER') {
    return 'Esta é uma turma Maker e aceita apenas Alunos Maker.';
  }

  if (error?.message === 'TURMA_APENAS_REGULAR') {
    return 'Esta é uma turma Regular e aceita apenas alunos regulares.';
  }

  return 'Nao foi possivel adicionar o aluno agora.';
}

export default DetalhesTurma;
