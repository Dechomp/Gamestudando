import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-gifted-charts';
import QRCode from 'react-native-qrcode-svg';

import { colors } from '../colors';
import { styles } from '../styles';
import {
  listarTurmasProfessor,
  montarValorQrTurma,
} from '../utils/firebaseTurmas';

const RelatorioProfessor = () => {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregar = async () => {
        try {
          setCarregando(true);
          const lista = await listarTurmasProfessor();

          if (!ativo) return;

          setTurmas(lista);
          setTurmaSelecionada((atual) =>
            atual ? lista.find((turma) => turma.id === atual.id) || null : null
          );
        } catch (error) {
          console.log(error);
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      };

      carregar();

      return () => {
        ativo = false;
        setTurmaSelecionada(null);
      };
    }, [])
  );

  const resumoTurma = useMemo(
    () => turmaSelecionada ? calcularResumoTurma(turmaSelecionada) : null,
    [turmaSelecionada]
  );

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
    >
      <Text style={styles.portalTituloMenor}>Relatorio por turma</Text>

      {carregando ? (
        <Text style={styles.contador}>Carregando turmas...</Text>
      ) : turmas.length === 0 ? (
        <Text style={styles.contador}>Nenhuma turma criada ainda.</Text>
      ) : (
        <>
          <Text style={styles.label}>Selecione a turma</Text>

          {turmas.map((turma) => (
            <TouchableOpacity
              key={turma.id}
              style={[
                styles.portalBotao,
                turmaSelecionada?.id === turma.id && styles.portalBotaoAtivo,
              ]}
              onPress={() => {
                setTurmaSelecionada((atual) =>
                  atual?.id === turma.id ? null : turma
                );
              }}
            >
              <Text style={styles.portalNomeCrianca}>{turma.nome}</Text>
              <Text style={styles.legendaTexto}>
                Codigo: {turma.codigo} - {turma.alunos.length} aluno(s)
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {turmaSelecionada && resumoTurma && (
        <View style={styles.portalQuadroRelatorio}>
          <Text style={styles.portalSubtitulo}>{turmaSelecionada.nome}</Text>
          <Text style={styles.portalValor}>Codigo: {turmaSelecionada.codigo}</Text>
          <Text style={styles.portalValor}>
            Alunos vinculados: {turmaSelecionada.alunos.length}
          </Text>

          <View style={styles.turmaQrBox}>
            <QRCode
              value={montarValorQrTurma(turmaSelecionada.codigo)}
              size={135}
            />
          </View>

          <View style={styles.portalSecao}>
            {['matematica', 'portugues'].map((materia) => (
              <View key={materia} style={styles.relatorioMateriaLinha}>
                <Text style={styles.configuracaoTexto}>{nomeMateria(materia)}</Text>
                <View style={styles.graficoContainer}>
                  <PieChart
                    data={gerarDadosPizzaResumo(resumoTurma[materia])}
                    donut
                    radius={48}
                    innerRadius={30}
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
            Maior dificuldade da turma: {resumoTurma.dificuldade}
          </Text>
          <Text style={styles.portalValor}>
            Recomendacao: {resumoTurma.recomendacao}
          </Text>

          <TouchableOpacity
            style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
            onPress={() => router.push({
              pathname: '/Professor/DetalhesTurma',
              params: { id: turmaSelecionada.id },
            })}
          >
            <Text style={styles.textoBotao}>Acessar turma</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

function calcularResumoTurma(turma) {
  const matematica = somarMateria(turma.alunos, 'matematica');
  const portugues = somarMateria(turma.alunos, 'portugues');
  const dificuldade = matematica.percentual <= portugues.percentual
    ? 'Matematica'
    : 'Portugues';

  return {
    matematica,
    portugues,
    dificuldade,
    recomendacao: dificuldade === 'Portugues'
      ? 'silabas, leitura de palavras e rimas'
      : 'contas simples e comparacao de numeros',
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

function obterDadosMateria(aluno, materia) {
  if (materia !== 'portugues') {
    return aluno.materias?.[materia] || {};
  }

  const portugues = aluno.materias?.portugues || {};
  const rimas = aluno.materias?.rimas || {};

  return {
    acertos: (portugues.acertos || 0) + (rimas.acertos || 0),
    erros: (portugues.erros || 0) + (rimas.erros || 0),
  };
}

function gerarDadosPizzaResumo(dados) {
  return [
    { value: dados.acertos || 0, color: colors.certa },
    { value: dados.erros || 0, color: colors.errada },
  ];
}

function nomeMateria(materia) {
  if (materia === 'matematica') return 'Matematica';
  if (materia === 'portugues') return 'Portugues';
  return materia;
}

export default RelatorioProfessor;
