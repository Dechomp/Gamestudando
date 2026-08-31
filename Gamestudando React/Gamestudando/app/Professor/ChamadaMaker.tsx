import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { styles } from "../styles";
import {
  listarTurmasMakerProfessor,
  mensagemErroMaker,
  finalizarChamadaMaker,
  listarAlunosMakerDaTurma,
} from "../utils/firebaseMaker";

export default function ChamadaMaker() {
  const router = useRouter();
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [moedasDaAula, setMoedasDaAula] = useState("2");
  const [niveisDaAula, setNiveisDaAula] = useState("1");
  const [recompensasExtras, setRecompensasExtras] = useState([]);
  const [alunosMaker, setAlunosMaker] = useState([]);
  const [ultimoRegistro] = useState(null);
  const params = useLocalSearchParams();
  const turmaInicialId = Array.isArray(params.turmaId) ? params.turmaId[0] : params.turmaId;
  const voltarParaTurma = () => turmaInicialId ? router.replace({ pathname: "/Professor/DetalhesTurma", params: { turmaId: turmaInicialId } }) : router.back();

  const carregarTurmas = useCallback(async () => {
    try {
      setTurmas(await listarTurmasMakerProfessor());
    } catch (error) {
      console.log("Erro carregando turmas:", error);
      Alert.alert("Chamada Maker", "Não foi possível carregar suas turmas.");
    }
  }, []);

  useFocusEffect(useCallback(() => { carregarTurmas(); }, [carregarTurmas]));

  const abrirCamera = () => {
    if (!turmaSelecionada) {
      Alert.alert("Chamada Maker", "Selecione uma turma antes de ler o QR.");
      return;
    }
    router.push({ pathname: "/Professor/LeitorQrMaker", params: { turmaId: turmaSelecionada.id } });
  };

  const selecionarTurma = async (turma) => {
    setTurmaSelecionada(turma);
    setAjudante(null);
    setRecompensasExtras([]);
    try { setAlunosMaker(await listarAlunosMakerDaTurma(turma.id)); }
    catch { setAlunosMaker([]); }
  };

  useEffect(() => {
    const turmaInicial = turmas.find((item) => item.id === turmaInicialId);
    if (turmaInicial && turmaSelecionada?.id !== turmaInicial.id) selecionarTurma(turmaInicial);
  }, [turmaInicialId, turmaSelecionada?.id, turmas]);

  const finalizar = async () => {
    if (!turmaSelecionada) return;
    const moedas = Number(moedasDaAula);
    const niveis = Number(niveisDaAula);
    if (!Number.isFinite(moedas) || moedas < 0 || !Number.isFinite(niveis) || niveis < 0) {
      Alert.alert("Finalizar aula", "Informe valores válidos, iguais ou maiores que zero.");
      return;
    }
    Alert.alert("Finalizar aula", `Confirmar presença, faltas, +${niveis} nível(is) e +${moedas} Maker Coins para os presentes?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Finalizar", onPress: async () => {
        try {
          setFinalizando(true);
          const resultado = await finalizarChamadaMaker({ turmaId: turmaSelecionada.id, moedasPorPresenca: moedas, niveisPorPresenca: niveis, recompensasExtras });
          Alert.alert("Aula finalizada", `${resultado.presentes} presença(s) e ${resultado.faltas} falta(s) registradas.`);
        } catch (error) {
          Alert.alert("Chamada Maker", mensagemErroMaker(error));
        } finally { setFinalizando(false); }
      } },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <TouchableOpacity style={styles.botaoVoltarTarefa} onPress={voltarParaTurma}><Text style={styles.textoVoltarTarefa}>← Voltar para a turma</Text></TouchableOpacity>
      <Text style={styles.perfilTitulo}>Chamada Maker</Text>
      <Text style={styles.legendaTexto}>Selecione a turma e leia o QR de cada Aluno Maker.</Text>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Turma</Text>
        {turmas.length === 0 ? <Text style={styles.legendaTexto}>Crie uma turma ou vincule alunos antes da chamada.</Text> : turmas.map((turma) => (
          <TouchableOpacity
            key={turma.id}
            style={[styles.portalBotao, turmaSelecionada?.id === turma.id && styles.portalBotaoAtivo]}
            onPress={() => selecionarTurma(turma)}
          >
            <Text style={styles.configuracaoTexto}>{turma.nome}</Text>
            <Text style={styles.legendaTexto}>{turma.totalAlunos} aluno(s) vinculado(s)</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.botaoSalvar} onPress={abrirCamera}>
        <Text style={styles.textoBotao}>Ler QR do aluno</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Níveis da aula</Text>
        <Text style={styles.legendaTexto}>Defina quantos níveis cada aluno presente ganhará ao finalizar a chamada.</Text>
        <Text style={styles.label}>Níveis por presença</Text>
        <TextInput value={niveisDaAula} onChangeText={setNiveisDaAula} style={styles.input} keyboardType="numeric" placeholder="Ex.: 1" />
      </View>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Distribuição de Maker Coins</Text>
        <Text style={styles.legendaTexto}>Esta recompensa geral será dada a todos os alunos que estiverem presentes.</Text>
        <Text style={styles.label}>Maker Coins por presença</Text>
        <TextInput value={moedasDaAula} onChangeText={setMoedasDaAula} style={styles.input} keyboardType="numeric" placeholder="Ex.: 2" />
        <Text style={styles.legendaTexto}>O ajudante presente recebe +2 Maker Coins além deste valor.</Text>
      </View>
      {!!turmaSelecionada && <View style={styles.card}>
        <Text style={styles.areaTitulo}>Recompensas extras do dia</Text>
        <Text style={styles.legendaTexto}>Crie quantas recompensas quiser; elas são dadas apenas a alunos presentes.</Text>
        <TouchableOpacity style={styles.botaoSalvar} onPress={() => setRecompensasExtras((atuais) => [...atuais, { id: String(Date.now()), titulo: "", moedas: "1", geral: true, alunoIds: [] }])}><Text style={styles.textoBotao}>+ Adicionar nova recompensa</Text></TouchableOpacity>
        {recompensasExtras.map((recompensa, indice) => <View key={recompensa.id} style={{ marginTop: 12 }}><TextInput value={recompensa.titulo} onChangeText={(valor) => setRecompensasExtras((atuais) => atuais.map((item, i) => i === indice ? { ...item, titulo: valor } : item))} style={styles.input} placeholder="Título: Ex.: Melhor trabalho em equipe" /><TextInput value={String(recompensa.moedas)} onChangeText={(valor) => setRecompensasExtras((atuais) => atuais.map((item, i) => i === indice ? { ...item, moedas: valor } : item))} style={styles.input} keyboardType="numeric" placeholder="Maker Coins" /><View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}><TouchableOpacity style={[styles.botaoEditar, { flex: 1 }, recompensa.geral && styles.portalBotaoAtivo]} onPress={() => setRecompensasExtras((atuais) => atuais.map((item, i) => i === indice ? { ...item, geral: true, alunoIds: [] } : item))}><Text style={styles.textoBotao}>Geral</Text></TouchableOpacity><TouchableOpacity style={[styles.botaoEditar, { flex: 1 }, !recompensa.geral && styles.portalBotaoAtivo]} onPress={() => setRecompensasExtras((atuais) => atuais.map((item, i) => i === indice ? { ...item, geral: false } : item))}><Text style={styles.textoBotao}>Selecionar alunos</Text></TouchableOpacity></View>{!recompensa.geral && alunosMaker.map((aluno) => <TouchableOpacity key={aluno.id} style={[styles.portalBotao, recompensa.alunoIds.includes(aluno.id) && styles.portalBotaoAtivo]} onPress={() => setRecompensasExtras((atuais) => atuais.map((item, i) => i !== indice ? item : { ...item, alunoIds: item.alunoIds.includes(aluno.id) ? item.alunoIds.filter((id) => id !== aluno.id) : [...item.alunoIds, aluno.id] }))}><Text style={styles.configuracaoTexto}>{aluno.nome}</Text></TouchableOpacity>)}<TouchableOpacity style={styles.botaoSair} onPress={() => setRecompensasExtras((atuais) => atuais.filter((_, i) => i !== indice))}><Text style={styles.textoBotao}>Remover recompensa</Text></TouchableOpacity></View>)}
      </View>}
      <TouchableOpacity style={[styles.botaoEditar, { marginTop: 10 }]} disabled={!turmaSelecionada || finalizando} onPress={finalizar}>
        <Text style={styles.textoBotao}>{finalizando ? "Finalizando..." : "Finalizar aula"}</Text>
      </TouchableOpacity>
      {ultimoRegistro && <View style={styles.card}><Text style={styles.areaTitulo}>Último registro</Text><Text style={styles.legendaTexto}>{ultimoRegistro.alunoNome}</Text></View>}
    </ScrollView>
  );
}
