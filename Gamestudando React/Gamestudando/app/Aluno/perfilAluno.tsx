import React, { useEffect, useState, useCallback } from "react";
import { Alert, View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { carregarPerfil, atualizarConfiguracoes } from "../utils/perfilAluno";
import { observarUsuarioLogado, sairDaConta } from "../utils/authUsuario";
import { listarTurmasDoAluno } from "../utils/firebaseTurmas";
import {
  listarResponsaveisDoAluno,
  montarValorQrAlunoResponsavel,
  obterOuCriarCodigoAlunoResponsavel,
} from "../utils/firebaseResponsaveis";
import { PieChart } from "react-native-gifted-charts";
import { styles } from "../styles";
import { colors } from "../colors";

export default function PerfilAluno() {

  const router = useRouter();
  const [perfil, setPerfil] = useState(null);
  const [verificandoLogin, setVerificandoLogin] = useState(true);
  const [turmas, setTurmas] = useState([]);
  const [responsaveis, setResponsaveis] = useState([]);
  const [codigoAluno, setCodigoAluno] = useState("");

  const carregar = useCallback(async () => {
    const dados = await carregarPerfil();

    if (!dados?.progresso?.avaliacaoInicialConcluida) {
      router.replace("/Aluno/avaliacaoInicial");
      return;
    }

    const [turmasAluno, responsaveisAluno, codigo] = await Promise.all([
      listarTurmasDoAluno().catch((error) => {
        console.log(error);
        return [];
      }),
      listarResponsaveisDoAluno().catch((error) => {
        console.log(error);
        return [];
      }),
      obterOuCriarCodigoAlunoResponsavel().catch((error) => {
        console.log(error);
        return "";
      }),
    ]);

    setPerfil(dados);
    setTurmas(turmasAluno);
    setResponsaveis(responsaveisAluno);
    setCodigoAluno(codigo);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  useEffect(() => {
    const parar = observarUsuarioLogado((usuario) => {
      setVerificandoLogin(false);

      if (!usuario) {
        setPerfil(null);
        router.replace("/Aluno");
      }
    });

    return parar;
  }, [router]);

  const deslogar = () => {
    Alert.alert(
      "Sair da conta",
      "Deseja sair desta conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await sairDaConta();
            router.replace("/Aluno");
          }
        }
      ]
    );
  };

  if (verificandoLogin || !perfil) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  const matematica = perfil.matematica;

  const portugues = {
    acertos: perfil.portugues.acertos + perfil.rimas.acertos,
    erros: perfil.portugues.erros + perfil.rimas.erros
  };

  const maker = perfil.maker || { nivel: 1, acertos: 0, erros: 0, atividadesConcluidas: 0 };

  const areas = [
    { nome: "Matemática", dados: matematica },
    { nome: "Português", dados: portugues },
    ...(perfil.tipo === "aluno_maker" ? [{ nome: "Maker", dados: maker, mostrarNivel: true }] : []),
  ];

  const gerarDadosPizza = (acertos, erros) => [
    { value: acertos, color: colors.certa },
    { value: erros, color: colors.errada }
  ];

  const leituraAtiva =
    perfil?.configuracoes?.leituraPerguntasAtiva !== false;

  const alternarLeitura = async (valor) => {
    const perfilAtualizado = await atualizarConfiguracoes({
      leituraPerguntasAtiva: valor
    });

    if (perfilAtualizado) {
      setPerfil(perfilAtualizado);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>

      <Text style={styles.perfilTitulo}>
         Relatório do Aluno
      </Text>

      <Text style={styles.perfilNome}>
         {perfil.nome || "Aluno"}
      </Text>

      <View style={styles.configuracaoCard}>
        <Text style={styles.configuracaoTexto}>
          Leitura das perguntas
        </Text>

        <Switch
          value={leituraAtiva}
          onValueChange={alternarLeitura}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Codigo do aluno</Text>
        <Text style={styles.turmaCodigo}>{codigoAluno || "Carregando..."}</Text>
        {!!codigoAluno && (
          <View style={styles.turmaQrBox}>
            <QRCode
              value={montarValorQrAlunoResponsavel(codigoAluno)}
              size={135}
            />
          </View>
        )}
        <Text style={styles.legendaTexto}>
          Professor ou responsavel pode ler este codigo para vincular você.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Minhas turmas</Text>

        {turmas.length === 0 ? (
          <Text style={styles.legendaTexto}>
            Voce ainda nao entrou em nenhuma turma.
          </Text>
        ) : (
          turmas.map((turma) => (
            <View key={turma.id} style={styles.turmaAlunoItem}>
              <Text style={styles.configuracaoTexto}>{turma.nome}</Text>
              <Text style={styles.legendaTexto}>
                Professor: {turma.professorNome || "Professor"}
              </Text>
              <Text style={styles.legendaTexto}>
                Codigo: {turma.codigo}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
          onPress={() => router.push("/Aluno/entrarTurma")}
        >
          <Text style={styles.textoBotao}>
            Entrar em turma
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Meus responsaveis</Text>

        {responsaveis.length === 0 ? (
          <Text style={styles.legendaTexto}>
            Nenhum responsavel vinculado ainda.
          </Text>
        ) : (
          responsaveis.map((responsavel) => (
            <View key={responsavel.id} style={styles.turmaAlunoItem}>
              <Text style={styles.configuracaoTexto}>
                {responsavel.nome || "Responsavel"}
              </Text>
              <Text style={styles.legendaTexto}>
                {responsavel.email || "Sem email"}
              </Text>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.botaoEditar, styles.botaoPerfilEspacado]}
          onPress={() => router.push("/Aluno/vincularResponsavel")}
        >
          <Text style={styles.textoBotao}>
            Vincular responsavel
          </Text>
        </TouchableOpacity>
      </View>

      {areas.map((area, index) => {

        const acertos = area.dados.acertos || 0;
        const erros = area.dados.erros || 0;
        const total = acertos + erros;

        const percentual =
          total === 0 ? 0 : Math.round((acertos / total) * 100);

        return (
          <View key={index} style={styles.card}>

            <Text style={styles.areaTitulo}>
              {area.nome}
            </Text>
            {area.mostrarNivel && <Text style={styles.legendaTexto}>Nível Maker: {area.dados.nivel || 1} · Atividades concluídas: {area.dados.atividadesConcluidas || 0}</Text>}

            <View style={styles.graficoContainer}>
              <PieChart
                data={gerarDadosPizza(acertos, erros)}
                donut
                radius={90}
                innerRadius={55}
                focusOnPress
                sectionAutoFocus
                centerLabelComponent={() => (
                  <Text style={styles.porcentagem}>
                    {percentual}%
                  </Text>
                )}
              />
            </View>

            <View style={styles.legendaContainer}>

              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, styles.legendaAcerto]} />
                <Text style={styles.legendaTexto}>
                  Acertos: {acertos}
                </Text>
              </View>

              <View style={styles.legendaItem}>
                <View style={[styles.legendaCor, styles.legendaErro]} />
                <Text style={styles.legendaTexto}>
                  Erros: {erros}
                </Text>
              </View>

            </View>

          </View>
        );
      })}

      <TouchableOpacity
        style={styles.botaoEditar}
        onPress={() => router.push("/Aluno/edicaoPerfilAluno")}
      >
        <Text style={styles.botaoTexto}>
          Editar perfil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoSair, styles.botaoPerfilEspacado]}
        onPress={deslogar}
      >
        <Text style={styles.textoBotao}>
          Sair da conta
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
