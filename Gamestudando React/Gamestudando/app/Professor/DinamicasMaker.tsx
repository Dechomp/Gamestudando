import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Easing, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { styles } from "../styles";
import { carregarCuriosidadeMaker, criarRoletaMaker, listarAlunosMakerPresentesDaTurma, listarRoletasMaker, listarTurmasMakerProfessor, mensagemErroMaker, renovarListaAjudantesMaker, salvarCuriosidadeMaker, sortearAjudanteMaker } from "../utils/firebaseMaker";

const DURACAO_GIRO_ROLETA = 2600;

const normalizarOpcoesDaRoleta = (opcoes: any[]) => (opcoes || []).map((opcao, index) => (
  typeof opcao === "string" ? { id: `${opcao}-${index}`, texto: opcao } : { id: opcao.id || `${opcao.nome || opcao.texto}-${index}`, texto: opcao.nome || opcao.texto || "Opção" }
));

function RoletaVisual({ resultado, girando }: { resultado: any; girando: boolean }) {
  const giro = useRef(new Animated.Value(0)).current;
  const opcoes = normalizarOpcoesDaRoleta(resultado?.opcoes || []);
  const indiceSorteado = Math.max(0, Math.min(resultado?.indiceSorteado ?? opcoes.findIndex((opcao) => opcao.texto === resultado?.valor), opcoes.length - 1));
  const anguloPorOpcao = opcoes.length ? 360 / opcoes.length : 0;

  React.useEffect(() => {
    if (!resultado || !opcoes.length) return;
    // A roleta termina sempre no índice efetivamente sorteado. Antes, ela
    // girava um número fixo de voltas e podia parar em outro nome visualmente.
    giro.setValue(0);
    Animated.timing(giro, { toValue: 1, duration: DURACAO_GIRO_ROLETA, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [anguloPorOpcao, giro, indiceSorteado, opcoes.length, resultado]);

  if (!resultado || !opcoes.length) return null;
  const anguloFinal = (360 * 6) - (indiceSorteado * anguloPorOpcao);
  const rotacao = giro.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${anguloFinal}deg`] });
  const larguraRotulo = opcoes.length > 8 ? 58 : opcoes.length > 5 ? 72 : 92;
  const raioRotulos = opcoes.length > 8 ? 88 : 82;
  return <View style={styles.card}>
    <Text style={styles.areaTitulo}>{resultado.titulo}</Text>
    <View style={styles.roletaArea}>
      <Text style={styles.roletaPonteiro}>▼</Text>
      <Animated.View style={[styles.roletaDisco, { transform: [{ rotate: rotacao }] }]}>
        <View style={styles.roletaAnelInterno} />
        {opcoes.map((opcao, index) => {
          const angulo = (index * 2 * Math.PI) / opcoes.length;
          const esquerda = 120 + Math.sin(angulo) * raioRotulos - larguraRotulo / 2;
          const topo = 120 - Math.cos(angulo) * raioRotulos - 15;
          return <View key={opcao.id} style={[styles.roletaOpcao, { left: esquerda, top: topo, width: larguraRotulo }, index === indiceSorteado && styles.roletaOpcaoSorteada]}><Text numberOfLines={2} style={[styles.roletaOpcaoTexto, index === indiceSorteado && styles.roletaOpcaoTextoSorteada]}>{opcao.texto}</Text></View>;
        })}
        <View style={styles.roletaCentro}><Text style={styles.roletaCentroTexto}>M</Text></View>
      </Animated.View>
    </View>
    <Text style={styles.roletaResultado}>{girando ? "Girando..." : `Resultado: ${resultado.valor}`}</Text>
  </View>;
}

export default function DinamicasMaker() {
  const router = useRouter();
  const [turmas, setTurmas] = useState<any[]>([]); const [turma, setTurma] = useState<any>(null);
  const [modoRoleta, setModoRoleta] = useState("menu"); const [curiosidade, setCuriosidade] = useState<any>(null);
  const [tituloRoleta, setTituloRoleta] = useState(""); const [opcoesRoleta, setOpcoesRoleta] = useState(""); const [roletas, setRoletas] = useState<any[]>([]); const [resultado, setResultado] = useState<any>(null); const [girando, setGirando] = useState(false);
  const params = useLocalSearchParams(); const turmaInicialId = Array.isArray(params.turmaId) ? params.turmaId[0] : params.turmaId;
  const voltarParaTurma = () => turmaInicialId ? router.replace({ pathname: "/Professor/DetalhesTurma", params: { turmaId: turmaInicialId } }) : router.back();
  const carregarTurmas = useCallback(async () => { try { setTurmas(await listarTurmasMakerProfessor()); } catch { Alert.alert("Maker", "Não foi possível carregar as turmas."); } }, []);
  useFocusEffect(useCallback(() => { carregarTurmas(); }, [carregarTurmas]));
  const carregarPresentes = async (turmaId = turma?.id) => {
    if (!turmaId) return [];
    const presentes = await listarAlunosMakerPresentesDaTurma(turmaId);
    return presentes;
  };
  const selecionarTurma = async (item: any) => { setTurma(item); setResultado(null); setModoRoleta("menu"); try { const [curiosidadeAtual, lista] = await Promise.all([carregarCuriosidadeMaker(item.id), listarRoletasMaker(item.id)]); setCuriosidade(curiosidadeAtual); setRoletas(lista); } catch { Alert.alert("Maker", "Não foi possível carregar os conteúdos da turma."); } };
  useEffect(() => { const turmaInicial = turmas.find((item) => item.id === turmaInicialId); if (turmaInicial && turma?.id !== turmaInicial.id) selecionarTurma(turmaInicial); }, [turma?.id, turmaInicialId, turmas]);
  const sortearResponsavelCuriosidade = async () => { try { const presentes = await carregarPresentes(); if (!presentes.length) return Alert.alert("Curiosidade do dia", "Faça a chamada antes: a roleta usa somente alunos presentes."); const indiceSorteado = Math.floor(Math.random() * presentes.length); const alunoSorteado = presentes[indiceSorteado]; await salvarCuriosidadeMaker({ turmaId: turma.id, alunoId: alunoSorteado.id, alunoNome: alunoSorteado.nome || "Aluno Maker" }); setCuriosidade({ alunoId: alunoSorteado.id, alunoNome: alunoSorteado.nome || "Aluno Maker" }); setGirando(true); setResultado({ titulo: "Quem traz a próxima curiosidade?", valor: alunoSorteado.nome || "Aluno Maker", indiceSorteado, opcoes: presentes.map((aluno) => ({ id: aluno.id, texto: aluno.nome || "Aluno Maker" })) }); setTimeout(() => setGirando(false), DURACAO_GIRO_ROLETA + 50); } catch { Alert.alert("Curiosidade do dia", "Não foi possível registrar o aluno sorteado."); } };
  const sortearAjudante = async () => { if (!turma) return; try { const presentes = await carregarPresentes(); const sorteado = await sortearAjudanteMaker(turma.id); const indiceSorteado = presentes.findIndex((aluno) => aluno.id === sorteado.alunoId); if (indiceSorteado < 0) throw new Error("SORTEADO_AUSENTE"); setGirando(true); setResultado({ titulo: "Roleta do ajudante do dia", valor: sorteado.alunoNome, indiceSorteado, opcoes: presentes.map((aluno) => ({ id: aluno.id, texto: aluno.nome || "Aluno Maker" })) }); setTimeout(() => setGirando(false), DURACAO_GIRO_ROLETA + 50); } catch (error) { Alert.alert("Roleta do ajudante", mensagemErroMaker(error)); } };
  const sortearAlunoDaTurma = async () => { try { const presentes = await carregarPresentes(); if (!presentes.length) return Alert.alert("Roleta da turma", "Faça a chamada antes: a roleta usa somente alunos presentes."); const indiceSorteado = Math.floor(Math.random() * presentes.length); const sorteado = presentes[indiceSorteado]; setGirando(true); setResultado({ titulo: "Roleta da turma", valor: sorteado.nome || "Aluno Maker", indiceSorteado, opcoes: presentes.map((aluno) => ({ id: aluno.id, texto: aluno.nome || "Aluno Maker" })) }); setTimeout(() => setGirando(false), DURACAO_GIRO_ROLETA + 50); } catch { Alert.alert("Roleta da turma", "Não foi possível carregar os alunos presentes."); } };
  const selecionarModo = (modo: string) => {
    setModoRoleta(modoRoleta === modo ? "menu" : modo);
    setResultado(null);
  };
  const atualizarParticipantes = async (titulo: string) => {
    try {
      const presentes = await carregarPresentes();
      Alert.alert(titulo, presentes.length ? `${presentes.length} aluno(s) presente(s) participará(ão) do próximo sorteio.` : "Nenhum aluno presente. Faça a chamada antes do sorteio.");
    } catch {
      Alert.alert(titulo, "Não foi possível atualizar a lista de alunos presentes.");
    }
  };
  const renovarAjudantes = () => Alert.alert("Renovar lista de ajudantes", "Todos os alunos presentes poderão voltar a ser sorteados. O histórico será preservado.", [
    { text: "Cancelar", style: "cancel" },
    { text: "Renovar", onPress: async () => {
      try {
        await renovarListaAjudantesMaker(turma.id);
        setResultado(null);
        Alert.alert("Lista renovada", "Os alunos voltaram a participar do próximo sorteio de ajudante.");
      } catch (error) {
        Alert.alert("Roleta do ajudante", mensagemErroMaker(error));
      }
    } },
  ]);
  const criarRoleta = async () => { try { await criarRoletaMaker({ turmaId: turma.id, titulo: tituloRoleta, opcoes: opcoesRoleta.split("\n") }); setTituloRoleta(""); setOpcoesRoleta(""); setRoletas(await listarRoletasMaker(turma.id)); Alert.alert("Roleta", "Roleta criada. Ela ficará disponível para novos sorteios."); } catch { Alert.alert("Roleta", "Informe um título e pelo menos duas opções, uma por linha."); } };
  const girar = (roleta: any) => { if (girando) return; const opcoes = roleta.opcoes || []; const indiceSorteado = Math.floor(Math.random() * opcoes.length); const valor = opcoes[indiceSorteado]; setGirando(true); setResultado({ titulo: roleta.titulo, valor, indiceSorteado, opcoes }); setTimeout(() => setGirando(false), DURACAO_GIRO_ROLETA + 50); };
  return <ScrollView contentContainerStyle={styles.perfilContainer}>
    <TouchableOpacity style={styles.botaoVoltarTarefa} onPress={voltarParaTurma}><Text style={styles.textoVoltarTarefa}>← Voltar para a turma</Text></TouchableOpacity>
    <Text style={styles.perfilTitulo}>Roletas Maker</Text>
    <Text style={styles.legendaTexto}>Escolha o tipo de roleta que deseja usar na turma.</Text>
    <View style={styles.card}><Text style={styles.areaTitulo}>Turma</Text>{turmas.map((item) => <TouchableOpacity key={item.id} onPress={() => selecionarTurma(item)} style={[styles.portalBotao, turma?.id === item.id && styles.portalBotaoAtivo]}><Text style={styles.configuracaoTexto}>{item.nome}</Text></TouchableOpacity>)}</View>
    {turma && <>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Tipos de roleta</Text>
        <Text style={styles.legendaTexto}>As roletas de ajudante, curiosidade e turma usam somente os alunos presentes na chamada do dia.</Text>
        <View style={styles.roletaTipoGrade}>
          <TouchableOpacity style={[styles.roletaTipoBotao, modoRoleta === "ajudante" && styles.roletaTipoBotaoAtivo]} disabled={girando} onPress={() => selecionarModo("ajudante")}><Text style={styles.roletaTipoTitulo}>🛠 Ajudante</Text><Text style={styles.roletaTipoDescricao}>Sorteia o ajudante entre os alunos presentes.</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.roletaTipoBotao, modoRoleta === "curiosidade" && styles.roletaTipoBotaoAtivo]} disabled={girando} onPress={() => selecionarModo("curiosidade")}><Text style={styles.roletaTipoTitulo}>🔎 Curiosidade</Text><Text style={styles.roletaTipoDescricao}>Sorteia quem trará a próxima curiosidade.</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.roletaTipoBotao, modoRoleta === "turma" && styles.roletaTipoBotaoAtivo]} disabled={girando} onPress={() => selecionarModo("turma")}><Text style={styles.roletaTipoTitulo}>👥 Turma</Text><Text style={styles.roletaTipoDescricao}>Sorteia um aluno presente da turma.</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.roletaTipoBotao, modoRoleta === "personalizada" && styles.roletaTipoBotaoAtivo]} onPress={() => selecionarModo("personalizada")}><Text style={styles.roletaTipoTitulo}>✏️ Personalizada</Text><Text style={styles.roletaTipoDescricao}>Crie uma roleta com as opções que quiser.</Text></TouchableOpacity>
        </View>
      </View>
      {modoRoleta === "ajudante" && <View style={styles.card}><Text style={styles.areaTitulo}>Roleta do ajudante</Text><Text style={styles.legendaTexto}>Quem já foi ajudante fica fora dos próximos sorteios, até você renovar esta lista.</Text><TouchableOpacity style={styles.botaoSalvar} disabled={girando} onPress={sortearAjudante}><Text style={styles.textoBotao}>{girando ? "Girando..." : "Sortear ajudante"}</Text></TouchableOpacity><TouchableOpacity style={styles.botaoEditar} disabled={girando} onPress={() => atualizarParticipantes("Alunos presentes")}><Text style={styles.textoBotao}>Atualizar alunos presentes</Text></TouchableOpacity><TouchableOpacity style={styles.botaoSair} disabled={girando} onPress={renovarAjudantes}><Text style={styles.textoBotao}>Renovar lista de ajudantes</Text></TouchableOpacity></View>}
      {modoRoleta === "curiosidade" && <><View style={styles.card}><Text style={styles.areaTitulo}>Roleta da curiosidade</Text><Text style={styles.legendaTexto}>Sorteia, entre os presentes, o aluno que trará a próxima curiosidade do dia.</Text><TouchableOpacity style={styles.botaoSalvar} disabled={girando} onPress={sortearResponsavelCuriosidade}><Text style={styles.textoBotao}>{girando ? "Girando..." : "Sortear responsável"}</Text></TouchableOpacity><TouchableOpacity style={styles.botaoEditar} disabled={girando} onPress={() => atualizarParticipantes("Alunos presentes")}><Text style={styles.textoBotao}>Atualizar alunos presentes</Text></TouchableOpacity></View>{!!curiosidade?.alunoNome && <View style={styles.card}><Text style={styles.areaTitulo}>Próxima curiosidade</Text><Text style={styles.configuracaoTexto}>{curiosidade.alunoNome} foi sorteado(a) para trazer a curiosidade.</Text></View>}</>}
      {modoRoleta === "turma" && <View style={styles.card}><Text style={styles.areaTitulo}>Roleta da turma</Text><Text style={styles.legendaTexto}>Sorteia um aluno entre quem está presente hoje.</Text><TouchableOpacity style={styles.botaoSalvar} disabled={girando} onPress={sortearAlunoDaTurma}><Text style={styles.textoBotao}>{girando ? "Girando..." : "Sortear aluno"}</Text></TouchableOpacity><TouchableOpacity style={styles.botaoEditar} disabled={girando} onPress={() => atualizarParticipantes("Alunos presentes")}><Text style={styles.textoBotao}>Atualizar alunos presentes</Text></TouchableOpacity></View>}
      {modoRoleta === "personalizada" && <><View style={styles.card}><Text style={styles.areaTitulo}>Nova roleta personalizada</Text><TextInput value={tituloRoleta} onChangeText={setTituloRoleta} style={styles.input} placeholder="Título: Ex.: Desafio Maker" /><TextInput value={opcoesRoleta} onChangeText={setOpcoesRoleta} style={[styles.input, { minHeight: 130, textAlignVertical: "top" }]} multiline placeholder={"Uma opção por linha\nEx.:\nConstruir ponte\nCriar robô\nTestar sensor"} /><TouchableOpacity style={styles.botaoSalvar} onPress={criarRoleta}><Text style={styles.textoBotao}>Salvar nova roleta</Text></TouchableOpacity></View><View style={styles.card}><Text style={styles.areaTitulo}>Roletas salvas</Text>{roletas.length === 0 ? <Text style={styles.legendaTexto}>Crie a primeira roleta personalizada da turma.</Text> : roletas.map((roleta) => <View key={roleta.id} style={styles.roletaSalvaItem}><Text style={styles.configuracaoTexto}>{roleta.titulo}</Text><Text style={styles.legendaTexto}>{roleta.opcoes?.length || 0} opções</Text><TouchableOpacity style={styles.botaoEditar} disabled={girando} onPress={() => girar(roleta)}><Text style={styles.textoBotao}>{girando ? "Girando..." : "Girar roleta"}</Text></TouchableOpacity></View>)}</View></>}
      <RoletaVisual resultado={resultado} girando={girando} />
    </>}
  </ScrollView>;
}
