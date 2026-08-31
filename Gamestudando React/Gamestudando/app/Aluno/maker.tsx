import React, { useCallback, useRef, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useFocusEffect } from "expo-router";

import { styles } from "../styles";
import { carregarPerfil } from "../utils/perfilAluno";
import { listarTurmasDoAluno, sincronizarResumoAlunoNasTurmas } from "../utils/firebaseTurmas";
import { carregarConfiguracoesMaker, carregarCuriosidadeMaker, carregarPerfilMaker, comprarProdutoMaker, enviarJustificativaMaker, listarHistoricoMaker, listarMinhasJustificativasMaker, listarProdutosMaker, montarValorQrMaker, obterQrMaker, REGRAS_MAKER_PADRAO } from "../utils/firebaseMaker";

const inicioDoMesAtual = () => {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
};

const chaveDoMes = (data: Date) => `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
const nomeDoMes = (data: Date) => data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
const exibirData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
};
const inicioDoMes = (valor: any) => {
  const data = valor?.toDate?.() || (valor ? new Date(valor) : inicioDoMesAtual());
  return new Date(data.getFullYear(), data.getMonth(), 1);
};

export default function MakerAluno() {
  const [perfil, setPerfil] = useState(null);
  const [codigo, setCodigo] = useState("");
  const [maker, setMaker] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState("");
  const [dataFalta, setDataFalta] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [minhasJustificativas, setMinhasJustificativas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [faltasRegistradas, setFaltasRegistradas] = useState([]);
  const [mesDasFaltas, setMesDasFaltas] = useState(inicioDoMesAtual);
  const [curiosidade, setCuriosidade] = useState(null);
  const [regras, setRegras] = useState(REGRAS_MAKER_PADRAO);
  const [carregando, setCarregando] = useState(true);
  // A referência é atualizada imediatamente ao tocar na turma. Assim, uma
  // atualização assíncrona anterior não consegue voltar a seleção sozinha.
  const turmaSelecionadaIdRef = useRef("");
  const requisicaoConteudoRef = useRef(0);

  const carregarConteudoDaTurma = useCallback(async (turmaId) => {
    const idDaRequisicao = ++requisicaoConteudoRef.current;
    if (!turmaId) {
      if (turmaSelecionadaIdRef.current === turmaId) {
        setMinhasJustificativas([]); setProdutos([]); setCuriosidade(null); setRegras(REGRAS_MAKER_PADRAO);
      }
      return;
    }
    const [justificativas, produtosDaTurma, proximaCuriosidade, configuracoes] = await Promise.allSettled([
      listarMinhasJustificativasMaker(turmaId),
      listarProdutosMaker(turmaId),
      carregarCuriosidadeMaker(turmaId),
      carregarConfiguracoesMaker(turmaId),
    ]);
    if (turmaSelecionadaIdRef.current !== turmaId || idDaRequisicao !== requisicaoConteudoRef.current) return;
    setMinhasJustificativas(justificativas.status === "fulfilled" ? justificativas.value : []);
    setProdutos(produtosDaTurma.status === "fulfilled" ? produtosDaTurma.value : []);
    setCuriosidade(proximaCuriosidade.status === "fulfilled" ? proximaCuriosidade.value : null);
    setRegras(configuracoes.status === "fulfilled" && configuracoes.value.regras?.length ? configuracoes.value.regras : REGRAS_MAKER_PADRAO);
  }, []);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await carregarPerfil();
      setPerfil(dados);

      if (dados?.tipo === "aluno_maker") {
        sincronizarResumoAlunoNasTurmas(dados.uid, dados).catch((error) => console.log("Erro sincronizando resumo Maker:", error));
        const resultado = await obterQrMaker();
        setCodigo(resultado.codigo);
        setMaker(await carregarPerfilMaker());
        const movimentos = await listarHistoricoMaker();
        setHistorico(movimentos);
        const turmasAluno = await listarTurmasDoAluno();
        setTurmas(turmasAluno);
        const turmaAtual = turmasAluno.find((item) => item.id === turmaSelecionadaIdRef.current) || turmasAluno[0];
        turmaSelecionadaIdRef.current = turmaAtual?.id || "";
        setTurmaSelecionadaId(turmaAtual?.id || "");
        setFaltasRegistradas(movimentos.filter((item) => item.tipo === "falta" && item.data && item.turmaId === turmaAtual?.id));
        await carregarConteudoDaTurma(turmaAtual?.id);
      }
    } catch (error) {
      console.log("Erro carregando QR Maker:", error);
      Alert.alert("Sala Maker", "Não foi possível carregar seu QR agora.");
    } finally {
      setCarregando(false);
    }
  }, [carregarConteudoDaTurma]);

  const enviarJustificativa = async () => {
    const turma = turmas.find((item) => item.id === turmaSelecionadaId);
    if (!turma) return Alert.alert("Justificativa", "Entre em uma turma antes de enviar a justificativa.");
    try {
      await enviarJustificativaMaker({ turmaId: turma.id, data: dataFalta, texto: justificativa });
      setDataFalta(""); setJustificativa("");
      setMinhasJustificativas(await listarMinhasJustificativasMaker(turma.id));
      Alert.alert("Justificativa enviada", "Seu professor poderá aprovar ou recusar a solicitação.");
    } catch (error) {
      Alert.alert("Justificativa", error.message === "JUSTIFICATIVA_CURTA" ? "Explique a falta com pelo menos 10 caracteres." : "Informe a data no formato AAAA-MM-DD.");
    }
  };

  const comprar = async (produto) => {
    const turma = turmas.find((item) => item.id === turmaSelecionadaId);
    if (!turma) return;
    try { await comprarProdutoMaker({ turmaId: turma.id, produtoId: produto.id }); Alert.alert("Loja Maker", "Pedido enviado ao professor para confirmação."); }
    catch (error) { Alert.alert("Loja Maker", error.message === "COINS_INSUFICIENTES" ? "Você não tem Maker Coins suficientes." : "Produto indisponível."); }
  };

  const selecionarTurma = async (turma) => {
    if (turma.id === turmaSelecionadaId) return;
    turmaSelecionadaIdRef.current = turma.id;
    setTurmaSelecionadaId(turma.id);
    setDataFalta(""); setJustificativa(""); setMesDasFaltas(inicioDoMes(turma.entrouEm));
    setFaltasRegistradas(historico.filter((item) => item.tipo === "falta" && item.data && item.turmaId === turma.id));
    try {
      await carregarConteudoDaTurma(turma.id);
    } catch {
      Alert.alert("Sala Maker", "Não foi possível carregar os dados desta turma.");
    }
  };

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const mesAtual = inicioDoMesAtual();
  const turmaSelecionada = turmas.find((item) => item.id === turmaSelecionadaId) || turmas[0];
  const mesDaEntrada = inicioDoMes(turmaSelecionada?.entrouEm);
  const estaNoMesAtual = chaveDoMes(mesDasFaltas) === chaveDoMes(mesAtual);
  const estaNoMesDaEntrada = chaveDoMes(mesDasFaltas) <= chaveDoMes(mesDaEntrada);
  const faltasDoMes = faltasRegistradas.filter((falta) => falta.data?.startsWith(chaveDoMes(mesDasFaltas)));

  if (perfil?.tipo !== "aluno_maker" && !carregando) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Esta área é exclusiva para Alunos Maker.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.perfilContainer}>
      <Text style={styles.perfilTitulo}>Sala Maker</Text>
      <Text style={styles.perfilNome}>{perfil?.nome || "Aluno Maker"}</Text>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Meu progresso</Text>
        <View style={styles.makerResumoGrade}>
          <View style={styles.makerResumoBloco}><Text style={styles.makerResumoRotulo}>Nível Maker</Text><Text style={styles.makerResumoValor}>{maker?.nivel ?? "..."}</Text></View>
          <View style={styles.makerResumoBloco}><Text style={styles.makerResumoRotulo}>Maker Coins</Text><Text style={styles.makerResumoValor}>{maker?.moedas ?? "..."}</Text></View>
          <View style={[styles.makerResumoBloco, styles.makerResumoBlocoLargo]}><Text style={styles.makerResumoRotulo}>Faltas registradas</Text><Text style={styles.makerResumoValor}>{maker?.faltasTotal ?? 0}</Text></View>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Minha turma atual</Text>
        <Text style={styles.legendaTexto}>Escolha a turma para ver as regras, loja, faltas e avisos dela.</Text>
        {turmas.length === 0 ? <Text style={styles.legendaTexto}>Você ainda não entrou em nenhuma turma Maker.</Text> : turmas.map((turma) => <TouchableOpacity key={turma.id} style={[styles.makerInformacaoBloco, turmaSelecionada?.id === turma.id && styles.portalBotaoAtivo]} onPress={() => selecionarTurma(turma)}><Text style={styles.makerInformacaoTitulo}>{turma.nome}</Text><Text style={styles.makerInformacaoTexto}>{turmaSelecionada?.id === turma.id ? "Turma selecionada" : "Toque para selecionar"}</Text></TouchableOpacity>)}
      </View>
      {!!curiosidade && <View style={styles.card}><Text style={styles.areaTitulo}>🔎 Próxima curiosidade do dia</Text><View style={styles.makerInformacaoBloco}><Text style={styles.makerInformacaoTexto}>{curiosidade.alunoNome ? `${curiosidade.alunoNome} foi sorteado(a) para trazer a próxima curiosidade.` : curiosidade.texto}</Text></View></View>}
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>📌 Regras da sua Sala Maker</Text>
        <Text style={styles.legendaTexto}>Estes são os combinados da turma. O professor pode atualizá-los quando necessário.</Text>
        <View style={styles.makerListaRegras}>
          {regras.map((regra, index) => <View key={`${index}-${regra}`} style={styles.makerRegraItem}><Text style={styles.makerRegraNumero}>{index + 1}</Text><Text style={styles.makerRegraTexto}>{regra}</Text></View>)}
        </View>
      </View>
      <View style={styles.card}><Text style={styles.areaTitulo}>Meu histórico Maker</Text>{historico.length === 0 ? <Text style={styles.legendaTexto}>Ainda não há movimentos.</Text> : historico.map((item) => <View key={item.id} style={styles.makerInformacaoBloco}><Text style={styles.makerInformacaoTitulo}>{item.categoria === "ocorrencia" ? "Ocorrência registrada" : item.tipo || "Aula"}</Text><Text style={styles.makerInformacaoTexto}>{item.categoria === "ocorrencia" ? item.motivo : `${item.moedas || 0} Maker Coins · ${item.niveis || 0} níveis`}</Text>{!!item.turmaId && <Text style={styles.legendaTexto}>{turmas.find((turma) => turma.id === item.turmaId)?.nome || "Outra turma"}</Text>}</View>)}</View>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Loja Maker</Text>
        {produtos.length === 0 ? <Text style={styles.legendaTexto}>A loja ainda não possui produtos.</Text> : produtos.map((produto) => <View key={produto.id} style={styles.makerInformacaoBloco}><Text style={styles.makerInformacaoTitulo}>{produto.nome}</Text><Text style={styles.makerInformacaoTexto}>{produto.preco} Maker Coins</Text>{!!produto.descricao && <Text style={styles.legendaTexto}>{produto.descricao}</Text>}<TouchableOpacity style={styles.botaoEditar} onPress={() => comprar(produto)}><Text style={styles.textoBotao}>Solicitar compra</Text></TouchableOpacity></View>)}
      </View>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>Justificar falta</Text>
        <Text style={styles.legendaTexto}>A justificativa fica pendente até a decisão do professor.</Text>
        <View style={styles.navegacaoMesFaltas}>
          <TouchableOpacity accessibilityLabel="Ver faltas do mês anterior" disabled={estaNoMesDaEntrada} style={[styles.setaMesFaltas, estaNoMesDaEntrada && styles.setaMesFaltasBloqueada]} onPress={() => setMesDasFaltas((mes) => new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}><Text style={[styles.setaMesFaltasTexto, estaNoMesDaEntrada && styles.setaMesFaltasTextoBloqueada]}>‹</Text></TouchableOpacity>
          <Text style={styles.nomeMesFaltas}>{nomeDoMes(mesDasFaltas)}</Text>
          <TouchableOpacity accessibilityLabel="Ver faltas do mês seguinte" disabled={estaNoMesAtual} style={[styles.setaMesFaltas, estaNoMesAtual && styles.setaMesFaltasBloqueada]} onPress={() => setMesDasFaltas((mes) => new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}><Text style={[styles.setaMesFaltasTexto, estaNoMesAtual && styles.setaMesFaltasTextoBloqueada]}>›</Text></TouchableOpacity>
        </View>
        <Text style={styles.legendaTexto}>Toque em uma falta para preencher a data da justificativa.</Text>
        {faltasDoMes.length === 0 ? <Text style={styles.legendaTexto}>Nenhuma falta registrada neste mês.</Text> : faltasDoMes.map((falta) => <TouchableOpacity key={falta.id} style={[styles.makerInformacaoBloco, dataFalta === falta.data && styles.portalBotaoAtivo]} onPress={() => setDataFalta(falta.data)}><Text style={styles.makerInformacaoTitulo}>{exibirData(falta.data)}</Text><Text style={styles.makerInformacaoTexto}>{dataFalta === falta.data ? "Falta selecionada para justificar" : "Toque para selecionar esta falta"}</Text></TouchableOpacity>)}
        <TextInput value={justificativa} onChangeText={setJustificativa} style={[styles.input, styles.campoJustificativaFalta, { minHeight: 90, textAlignVertical: "top" }]} multiline placeholder="Explique o motivo da falta" />
        <TouchableOpacity disabled={!dataFalta} style={[styles.botaoEditar, styles.botaoJustificativaFalta, !dataFalta && styles.botaoDesabilitado]} onPress={enviarJustificativa}><Text style={styles.textoBotao}>Enviar para o professor</Text></TouchableOpacity>
        {minhasJustificativas.map((item) => <View key={item.id} style={styles.makerInformacaoBloco}><Text style={styles.makerInformacaoTitulo}>Falta de {exibirData(item.data)}</Text><Text style={styles.makerInformacaoTexto}>Status: {item.status}</Text>{!!item.comentario && <Text style={styles.legendaTexto}>Comentário do professor: {item.comentario}</Text>}</View>)}
      </View>
      <View style={styles.card}>
        <Text style={styles.areaTitulo}>QR de presença</Text>
        <Text style={styles.legendaTexto}>
          Mostre este QR ao professor no início da aula para confirmar sua presença.
        </Text>
        <View style={styles.turmaQrBox}>
          {codigo ? <QRCode value={montarValorQrMaker(codigo)} size={190} /> : <Text>Carregando QR...</Text>}
        </View>
        <Text style={styles.turmaCodigo}>{codigo || "..."}</Text>
        <TouchableOpacity style={styles.botaoEditar} disabled={carregando} onPress={carregar}>
          <Text style={styles.textoBotao}>Atualizar QR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
