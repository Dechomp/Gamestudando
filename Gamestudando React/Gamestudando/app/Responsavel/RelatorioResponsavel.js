import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { PieChart } from "react-native-gifted-charts";

import { colors } from "../colors";
import { styles } from "../styles";
import {
  listarAlunosResponsavel,
  removerAlunoResponsavel,
} from "../utils/firebaseResponsaveis";

export default function RelatorioResponsavel() {
  const [alunos, setAlunos] = useState([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const lista = await listarAlunosResponsavel();

      setAlunos(lista);
      setAlunoSelecionado((atual) =>
        atual ? lista.find((aluno) => aluno.id === atual.id) || null : null
      );
    } catch (error) {
      console.log(error);
      Alert.alert("Relatorio", "Nao foi possivel carregar os alunos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();

      return () => {
        setAlunoSelecionado(null);
      };
    }, [carregar])
  );

  const resumoGeral = useMemo(
    () => calcularResumoAlunos(alunos),
    [alunos]
  );

  const confirmarRemoverAluno = (aluno) => {
    Alert.alert(
      "Remover aluno",
      `Deseja remover ${aluno.nome || "este aluno"} dos seus relatorios?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await removerAlunoResponsavel(aluno.id);
            setAlunoSelecionado(null);
            await carregar();
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.portalContainer}
      contentContainerStyle={styles.portalContent}
    >
      <Text style={styles.portalTituloMenor}>Relatorio dos alunos</Text>

      {carregando ? (
        <Text style={styles.contador}>Carregando alunos...</Text>
      ) : alunos.length === 0 ? (
        <Text style={styles.contador}>Nenhum aluno vinculado ainda.</Text>
      ) : (
        <>
          <View style={styles.portalQuadroRelatorio}>
            <Text style={styles.portalSubtitulo}>Resumo geral</Text>

            <View style={styles.portalSecao}>
              {["matematica", "portugues"].map((materia) => (
                <View key={materia} style={styles.relatorioMateriaLinha}>
                  <Text style={styles.configuracaoTexto}>
                    {nomeMateria(materia)}
                  </Text>
                  <View style={styles.graficoContainer}>
                    <PieChart
                      data={gerarDadosPizzaResumo(resumoGeral[materia])}
                      donut
                      radius={45}
                      innerRadius={28}
                      centerLabelComponent={() => (
                        <Text style={styles.textoPequeno}>
                          {resumoGeral[materia].percentual}%
                        </Text>
                      )}
                    />
                  </View>
                  <Text style={styles.legendaTexto}>
                    {resumoGeral[materia].percentual}% de acerto
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.portalValor}>
              Maior dificuldade: {resumoGeral.dificuldade}
            </Text>
            <Text style={styles.portalValor}>
              Recomendacao: {resumoGeral.recomendacao}
            </Text>
          </View>

          <Text style={styles.label}>Alunos vinculados</Text>

          {alunos.map((aluno) => (
            <TouchableOpacity
              key={aluno.id}
              style={[
                styles.portalBotaoCrianca,
                alunoSelecionado?.id === aluno.id && styles.portalBotaoAtivo,
              ]}
              onPress={() => {
                setAlunoSelecionado((atual) =>
                  atual?.id === aluno.id ? null : aluno
                );
              }}
            >
              <Text style={styles.portalNomeCrianca}>
                {aluno.nome || "Aluno"}
              </Text>
              <Text style={styles.legendaTexto}>
                Atividades: {aluno.atividadesConcluidas || 0}
              </Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {alunoSelecionado && (
        <View style={styles.portalQuadroRelatorio}>
          <Text style={styles.portalSubtitulo}>
            {alunoSelecionado.nome || "Aluno"}
          </Text>

          <Text style={styles.portalValor}>
            Dificuldade principal: {calcularDificuldade(alunoSelecionado)}
          </Text>
          <Text style={styles.portalValor}>
            Recomendacao: {recomendarTema(alunoSelecionado)}
          </Text>

          <View style={styles.portalSecao}>
            {["matematica", "portugues"].map((materia) => (
              <View key={materia} style={styles.relatorioMateriaLinha}>
                <Text style={styles.configuracaoTexto}>
                  {nomeMateria(materia)}
                </Text>
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
            <Text style={styles.textoBotao}>Remover aluno</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function calcularResumoAlunos(alunos) {
  const matematica = somarMateria(alunos, "matematica");
  const portugues = somarMateria(alunos, "portugues");
  const dificuldade = matematica.percentual <= portugues.percentual
    ? "Matematica"
    : "Portugues";

  return {
    matematica,
    portugues,
    dificuldade,
    recomendacao: dificuldade === "Portugues"
      ? "silabas, leitura de palavras e rimas"
      : "contas simples e comparacao de numeros",
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

function calcularPercentual(aluno, materia) {
  const dados = obterDadosMateria(aluno, materia);
  const acertos = dados.acertos || 0;
  const erros = dados.erros || 0;
  const total = acertos + erros;

  if (!total) return 0;

  return Math.round((acertos / total) * 100);
}

function calcularDificuldade(aluno) {
  const materias = ["matematica", "portugues"];
  const pior = materias
    .map((materia) => ({
      materia,
      percentual: calcularPercentual(aluno, materia),
    }))
    .sort((a, b) => a.percentual - b.percentual)[0];

  return nomeMateria(pior?.materia || "matematica");
}

function recomendarTema(aluno) {
  const dificuldade = calcularDificuldade(aluno);

  if (dificuldade === "Portugues") return "silabas e rimas";
  return "contas simples e comparacao de numeros";
}

function obterDadosMateria(aluno, materia) {
  if (materia !== "portugues") {
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
  if (materia === "matematica") return "Matematica";
  if (materia === "portugues") return "Portugues";
  return materia;
}
