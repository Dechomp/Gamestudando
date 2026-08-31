import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { styles } from "../styles";
import {
  atualizarProdutoMaker, carregarConfiguracoesMaker, criarProdutoMaker, decidirJustificativaMaker, decidirPedidoMaker,
  listarAlunosMakerDaTurma, listarHistoricoProfessorMaker, listarPedidosMaker,
  listarJustificativasMaker, listarProdutosMaker, listarTurmasMakerProfessor, registrarIndicacaoMaker,
  registrarOcorrenciaMaker, salvarConfiguracoesMaker, salvarObservacaoMaker,
} from "../utils/firebaseMaker";

const historicoVazio = { observacoes: [], ocorrencias: [], movimentos: [], compras: [] };
const dataTexto = (valor: any) => valor?.toDate?.().toLocaleDateString("pt-BR") || "Sem data";

export default function GestaoMaker() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const params = useLocalSearchParams();
  const turmaInicialId = Array.isArray(params.turmaId) ? params.turmaId[0] : params.turmaId;
  const [turmas, setTurmas] = useState<any[]>([]); const [turma, setTurma] = useState<any>(null);
  const [aba, setAba] = useState("regras");
  const [alunos, setAlunos] = useState<any[]>([]); const [produtos, setProdutos] = useState<any[]>([]); const [pedidos, setPedidos] = useState<any[]>([]);
  const [config, setConfig] = useState({ moedasPorPresenca: "2", niveisPorPresenca: "1", bonusIndicacao: "3", regrasTexto: "" });
  const [nome, setNome] = useState(""); const [descricao, setDescricao] = useState(""); const [preco, setPreco] = useState(""); const [estoque, setEstoque] = useState(""); const [produtoEditando, setProdutoEditando] = useState<any>(null); const [comentarioPedido, setComentarioPedido] = useState("");
  const [destinoProduto, setDestinoProduto] = useState<"atual" | "escolhidas" | "todas">("atual"); const [outrasTurmasProduto, setOutrasTurmasProduto] = useState<string[]>([]);
  const [aluno, setAluno] = useState<any>(null); const [historico, setHistorico] = useState<any>(historicoVazio); const [observacao, setObservacao] = useState(""); const [motivo, setMotivo] = useState(""); const [multaCoins, setMultaCoins] = useState("0"); const [multaNiveis, setMultaNiveis] = useState("0"); const [indicador, setIndicador] = useState<any>(null); const [indicado, setIndicado] = useState<any>(null); const [justificativas, setJustificativas] = useState<any[]>([]); const [comentarioJustificativa, setComentarioJustificativa] = useState("");
  const voltar = () => turmaInicialId ? router.replace({ pathname: "/Professor/DetalhesTurma", params: { id: turmaInicialId } }) : router.back();

  const carregarTurmas = useCallback(() => listarTurmasMakerProfessor().then(setTurmas).catch(() => Alert.alert("Maker", "Não foi possível carregar as turmas.")), []);
  useFocusEffect(useCallback(() => { carregarTurmas(); }, [carregarTurmas]));
  const atualizarListas = async (id: string) => { const [a, p, pe] = await Promise.all([listarAlunosMakerDaTurma(id), listarProdutosMaker(id), listarPedidosMaker(id, false)]); setAlunos(a); setProdutos(p); setPedidos(pe); };
  const selecionarTurma = async (item: any) => { setTurma(item); setAluno(null); try { const [regras] = await Promise.all([carregarConfiguracoesMaker(item.id), atualizarListas(item.id), listarJustificativasMaker(item.id).then(setJustificativas)]); setConfig({ moedasPorPresenca: String(regras.moedasPorPresenca), niveisPorPresenca: String(regras.niveisPorPresenca), bonusIndicacao: String(regras.bonusIndicacao), regrasTexto: regras.regras.join("\n") }); } catch { setJustificativas([]); Alert.alert("Maker", "Não foi possível carregar esta turma."); } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const inicial = turmas.find((item) => item.id === turmaInicialId); if (inicial && turma?.id !== inicial.id) selecionarTurma(inicial); }, [turma?.id, turmaInicialId, turmas]);
  const salvarRegras = async () => { try { await salvarConfiguracoesMaker({ turmaId: turma.id, ...config, regras: config.regrasTexto.split("\n") }); Alert.alert("Regras", "Regras salvas e disponíveis para os alunos."); } catch { Alert.alert("Regras", "Informe valores válidos e pelo menos uma regra."); } };
  const limparProduto = () => { setNome(""); setDescricao(""); setPreco(""); setEstoque(""); setProdutoEditando(null); setDestinoProduto("atual"); setOutrasTurmasProduto([]); };
  const selecionarProduto = (produto: any) => {
    if (produtoEditando?.id === produto.id) {
      limparProduto();
      return;
    }
    setProdutoEditando(produto);
    setNome(produto.nome || "");
    setDescricao(produto.descricao || "");
    setPreco(String(produto.preco ?? ""));
    setEstoque(produto.estoque == null ? "" : String(produto.estoque));
  };
  const alternarTurmaDoProduto = (turmaId: string) => setOutrasTurmasProduto((atuais) => atuais.includes(turmaId) ? atuais.filter((id) => id !== turmaId) : [...atuais, turmaId]);
  const salvarProduto = async () => { try {
    if (produtoEditando) {
      await atualizarProdutoMaker({ turmaId: turma.id, produtoId: produtoEditando.id, nome, descricao, preco, estoque, ativo: produtoEditando.ativo !== false });
      Alert.alert("Loja", "Produto atualizado nesta turma.");
    } else {
      const turmaIds = destinoProduto === "todas" ? turmas.map((item) => item.id) : destinoProduto === "escolhidas" ? [turma.id, ...outrasTurmasProduto] : [turma.id];
      const total = await criarProdutoMaker({ turmaId: turma.id, turmaIds, nome, descricao, preco, estoque });
      Alert.alert("Loja", total === 1 ? "Produto criado nesta turma." : `Produto criado em ${total} turmas.`);
    }
    limparProduto(); await atualizarListas(turma.id);
  } catch { Alert.alert("Loja", "Preencha nome e preço corretamente."); } };
  const selecionarAluno = async (item: any) => {
    if (aluno?.id === item.id) {
      setAluno(null);
      setHistorico(historicoVazio);
      return;
    }
    setAluno(item);
    try { setHistorico(await listarHistoricoProfessorMaker({ turmaId: turma.id, alunoId: item.id })); } catch { setHistorico(historicoVazio); }
  };
  const registrar = async (tipo: "observacao" | "ocorrencia") => {
    if (!aluno) return Alert.alert("Maker", "Selecione um aluno primeiro.");
    const moedas = Number(multaCoins || 0);
    const niveis = Number(multaNiveis || 0);
    if (tipo === "observacao" && !observacao.trim()) return Alert.alert("Registro privado", "Escreva a observação antes de salvar.");
    if (tipo === "ocorrencia" && !motivo.trim()) return Alert.alert("Ocorrência", "Informe o motivo da ocorrência.");
    if (tipo === "ocorrencia" && (!Number.isFinite(moedas) || moedas < 0 || !Number.isFinite(niveis) || niveis < 0)) return Alert.alert("Ocorrência", "Os descontos devem ser números iguais ou maiores que zero.");
    try {
      if (tipo === "observacao") {
        await salvarObservacaoMaker({ turmaId: turma.id, alunoId: aluno.id, texto: observacao });
        setObservacao("");
      } else {
        await registrarOcorrenciaMaker({ turmaId: turma.id, alunoId: aluno.id, motivo, moedas, niveis });
        setMotivo("");
        setMultaCoins("0");
        setMultaNiveis("0");
      }
      // Falhas pontuais ao recarregar não podem fazer um registro já salvo parecer erro.
      try { setHistorico(await listarHistoricoProfessorMaker({ turmaId: turma.id, alunoId: aluno.id })); } catch (erroHistorico) { console.log("Erro recarregando histórico Maker:", erroHistorico); }
      Alert.alert("Maker", "Registro salvo.");
    } catch (error: any) {
      console.log("Erro registrando Maker:", error);
      Alert.alert("Maker", error?.code === "permission-denied" ? "Sem permissão para registrar esta ocorrência." : "Não foi possível salvar o registro. Tente novamente.");
    }
  };
  const decidirPedido = async (pedido: any, aprovar: boolean) => { try { await decidirPedidoMaker({ turmaId: turma.id, pedidoId: pedido.id, aprovar, comentario: comentarioPedido }); setComentarioPedido(""); await atualizarListas(turma.id); } catch { Alert.alert("Pedido", "Não foi possível concluir o pedido."); } };
  const decidirJustificativa = async (item: any, aprovada: boolean) => {
    try {
      await decidirJustificativaMaker({ turmaId: turma.id, justificativaId: item.id, aprovada, comentario: comentarioJustificativa });
      setComentarioJustificativa("");
      setJustificativas(await listarJustificativasMaker(turma.id));
      Alert.alert("Justificativa", aprovada ? "Justificativa aprovada e falta ajustada." : "Justificativa recusada.");
    } catch {
      Alert.alert("Justificativa", "Não foi possível analisar esta justificativa.");
    }
  };
  const indicar = async () => { if (!indicador || !indicado) return Alert.alert("Indicação", "Selecione os dois alunos."); if (indicador.id === indicado.id) return Alert.alert("Indicação", "Escolha alunos diferentes para cada papel."); try { await registrarIndicacaoMaker({ turmaId: turma.id, alunoIndicadorId: indicador.id, alunoIndicadoId: indicado.id }); Alert.alert("Indicação", "Registrada. O bônus será entregue após a primeira presença do aluno indicado."); } catch { Alert.alert("Indicação", "Não foi possível registrar."); } };
  const alternarIndicador = (item: any) => {
    if (indicado?.id === item.id) return Alert.alert("Indicação", "O mesmo aluno não pode ser quem convidou e quem foi convidado.");
    setIndicador((atual: any) => atual?.id === item.id ? null : item);
  };
  const alternarIndicado = (item: any) => {
    if (indicador?.id === item.id) return Alert.alert("Indicação", "O mesmo aluno não pode ser quem convidou e quem foi convidado.");
    setIndicado((atual: any) => atual?.id === item.id ? null : item);
  };

  const focarCampoDeRegras = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 450);
  const focarEditorDeRegras = () => {
    // No Android, o teclado termina de abrir depois do onFocus. Repetir a rolagem
    // mantém o editor inteiro acima do teclado, mesmo em aparelhos mais lentos.
    [0, 350, 850].forEach((atraso) => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), atraso));
  };

  return <ScrollView ref={scrollRef} contentContainerStyle={styles.perfilContainer} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag">
    <TouchableOpacity style={styles.botaoVoltarTarefa} onPress={voltar}><Text style={styles.textoVoltarTarefa}>← Voltar para a turma</Text></TouchableOpacity>
    <Text style={styles.perfilTitulo}>Administrar Sala Maker</Text>
    <View style={styles.card}><Text style={styles.areaTitulo}>Turma</Text>{turmas.map((item) => <TouchableOpacity key={item.id} onPress={() => selecionarTurma(item)} style={[styles.portalBotao, turma?.id === item.id && styles.portalBotaoAtivo]}><Text style={styles.configuracaoTexto}>{item.nome}</Text></TouchableOpacity>)}</View>
    {turma && <><View style={styles.gestaoMakerAbas}>{[["regras", "Regras"], ["loja", "Loja"], ["alunos", "Recomendações"], ["justificativas", "Justificativas"], ["registros", "Registros"], ["ocorrencias", "Ocorrências"]].map(([id, titulo]) => <TouchableOpacity key={id} onPress={() => setAba(id)} style={[styles.gestaoMakerAba, aba === id && styles.gestaoMakerAbaAtiva]}><Text style={[styles.gestaoMakerAbaTexto, aba === id && styles.gestaoMakerAbaTextoAtivo]}>{titulo}</Text></TouchableOpacity>)}</View>
      {aba === "regras" && <View style={styles.card}><Text style={styles.areaTitulo}>Regras e recompensas</Text><Text style={styles.legendaTexto}>As regras abaixo já são as regras atuais da turma. Você pode alterá-las antes de salvar.</Text><View style={styles.gestaoMakerGrupo}><Text style={styles.configuracaoTexto}>Recompensas da aula</Text><Text style={styles.legendaTexto}>Valores padrão que o professor poderá ajustar ao fechar cada chamada.</Text><Text style={styles.label}>Maker Coins por presença</Text><TextInput value={config.moedasPorPresenca} onFocus={focarCampoDeRegras} onChangeText={(v) => setConfig({ ...config, moedasPorPresenca: v })} style={styles.input} keyboardType="numeric" /><Text style={styles.label}>Níveis por presença</Text><TextInput value={config.niveisPorPresenca} onFocus={focarCampoDeRegras} onChangeText={(v) => setConfig({ ...config, niveisPorPresenca: v })} style={styles.input} keyboardType="numeric" /></View><View style={styles.gestaoMakerGrupo}><Text style={styles.configuracaoTexto}>Indicação de aluno novo</Text><Text style={styles.label}>Bônus em Maker Coins</Text><TextInput value={config.bonusIndicacao} onFocus={focarCampoDeRegras} onChangeText={(v) => setConfig({ ...config, bonusIndicacao: v })} style={styles.input} keyboardType="numeric" /></View><View style={styles.gestaoMakerGrupo}><Text style={styles.configuracaoTexto}>Regras visíveis aos alunos</Text><Text style={styles.legendaTexto}>Uma regra por linha.</Text><TextInput value={config.regrasTexto} onFocus={focarEditorDeRegras} onChangeText={(v) => setConfig({ ...config, regrasTexto: v })} style={[styles.input, { minHeight: 180, textAlignVertical: "top" }]} multiline placeholder="Uma regra por linha" /></View><TouchableOpacity style={styles.botaoSalvar} onPress={salvarRegras}><Text style={styles.textoBotao}>Salvar regras</Text></TouchableOpacity></View>}
      {aba === "loja" && <>
        <View style={styles.card}>
          <Text style={styles.areaTitulo}>{produtoEditando ? "Editar produto" : "Novo produto"}</Text>
          <TextInput value={nome} onChangeText={setNome} style={styles.input} placeholder="Nome do produto" />
          <TextInput value={descricao} onChangeText={setDescricao} style={styles.input} placeholder="Descrição" />
          <TextInput value={preco} onChangeText={setPreco} style={styles.input} keyboardType="numeric" placeholder="Preço em Maker Coins" />
          <TextInput value={estoque} onChangeText={setEstoque} style={styles.input} keyboardType="numeric" placeholder="Estoque (vazio = ilimitado)" />
          {!produtoEditando && <View style={styles.gestaoMakerGrupo}>
            <Text style={styles.configuracaoTexto}>Onde publicar este produto?</Text>
            <Text style={styles.legendaTexto}>A turma atual sempre fica incluída. Você pode repetir o mesmo produto nas suas outras turmas Maker.</Text>
            <TouchableOpacity style={[styles.portalBotao, destinoProduto === "atual" && styles.portalBotaoAtivo]} onPress={() => { setDestinoProduto("atual"); setOutrasTurmasProduto([]); }}><Text style={styles.configuracaoTexto}>Somente nesta turma</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.portalBotao, destinoProduto === "escolhidas" && styles.portalBotaoAtivo]} onPress={() => setDestinoProduto("escolhidas")}><Text style={styles.configuracaoTexto}>Escolher outras turmas</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.portalBotao, destinoProduto === "todas" && styles.portalBotaoAtivo]} onPress={() => { setDestinoProduto("todas"); setOutrasTurmasProduto([]); }}><Text style={styles.configuracaoTexto}>Todas as minhas turmas Maker</Text></TouchableOpacity>
            {destinoProduto === "escolhidas" && <View style={styles.gestaoMakerGrupo}>
              <Text style={styles.label}>Selecione as outras turmas</Text>
              {turmas.filter((item) => item.id !== turma.id).length === 0 ? <Text style={styles.legendaTexto}>Você ainda não possui outra turma Maker.</Text> : turmas.filter((item) => item.id !== turma.id).map((item) => <TouchableOpacity key={item.id} style={[styles.portalBotao, outrasTurmasProduto.includes(item.id) && styles.portalBotaoAtivo]} onPress={() => alternarTurmaDoProduto(item.id)}><Text style={styles.configuracaoTexto}>{item.nome}</Text><Text style={styles.legendaTexto}>{outrasTurmasProduto.includes(item.id) ? "Selecionada — toque para retirar" : "Toque para adicionar"}</Text></TouchableOpacity>)}
            </View>}
          </View>}
          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarProduto}><Text style={styles.textoBotao}>{produtoEditando ? "Salvar alterações" : "Criar produto"}</Text></TouchableOpacity>
          {produtoEditando && <TouchableOpacity style={styles.botaoEditar} onPress={limparProduto}><Text style={styles.textoBotao}>Cancelar edição</Text></TouchableOpacity>}
        </View>
        <View style={styles.card}>
          <Text style={styles.areaTitulo}>Produtos e pedidos</Text>
          {produtos.map((p) => <TouchableOpacity key={p.id} style={[styles.portalBotao, produtoEditando?.id === p.id && styles.portalBotaoAtivo]} onPress={() => selecionarProduto(p)}><Text style={styles.configuracaoTexto}>{p.nome} · {p.preco} coins</Text><Text style={styles.legendaTexto}>{produtoEditando?.id === p.id ? "Selecionado — toque para desmarcar" : "Toque para editar"}</Text></TouchableOpacity>)}
          {pedidos.map((p) => <View key={p.id} style={styles.gestaoMakerItem}><Text style={styles.configuracaoTexto}>{p.produtoNome} · {p.status}</Text>{p.status === "pendente" && <><TextInput value={comentarioPedido} onChangeText={setComentarioPedido} style={styles.input} placeholder="Comentário (opcional)" /><View style={styles.linhaAcoesPedido}><TouchableOpacity style={[styles.botaoSalvar, styles.botaoPedido]} onPress={() => decidirPedido(p, true)}><Text style={styles.textoBotao}>Aprovar</Text></TouchableOpacity><TouchableOpacity style={[styles.botaoSair, styles.botaoPedido]} onPress={() => decidirPedido(p, false)}><Text style={styles.textoBotao}>Recusar</Text></TouchableOpacity></View></>}</View>)}
        </View>
      </>}
      {aba === "alunos" && <>
        <View style={styles.card}>
          <Text style={styles.areaTitulo}>Recomendação de aluno novo</Text>
          <Text style={styles.legendaTexto}>Escolha quem recomendou e quem foi recomendado. O bônus será dado ao aluno que recomendou após a primeira presença do novo colega.</Text>
          <Text style={styles.label}>Quem recomendou</Text>
          <Text style={styles.indicacaoSelecionada}>{indicador?.nome || "Nenhum aluno selecionado"}</Text>
          <Text style={styles.label}>Quem foi recomendado</Text>
          <Text style={styles.indicacaoSelecionada}>{indicado?.nome || "Nenhum aluno selecionado"}</Text>
          <TouchableOpacity style={[styles.botaoSalvar, (!indicador || !indicado) && styles.botaoDesabilitado]} disabled={!indicador || !indicado} onPress={indicar}><Text style={styles.textoBotao}>Confirmar recomendação</Text></TouchableOpacity>
        </View>
        <View style={styles.card}>
          <Text style={styles.areaTitulo}>Alunos para recomendação</Text>
          <Text style={styles.legendaTexto}>Use os dois botões para definir os alunos da recomendação. Os registros privados ficam na opção Registros.</Text>
          {alunos.map((item) => <View key={item.id} style={styles.gestaoMakerItem}>
            <View style={styles.portalBotao}><Text style={styles.configuracaoTexto}>{item.nome}</Text><Text style={styles.legendaTexto}>Nível {item.maker?.nivel || 1} · {item.maker?.moedas || 0} coins · {item.maker?.faltasTotal || 0} faltas</Text></View>
            <View style={styles.gestaoMakerAcoesVerticais}>
              <TouchableOpacity style={[styles.botaoEditar, indicador?.id === item.id && styles.portalBotaoAtivo]} onPress={() => alternarIndicador(item)}><Text style={styles.textoBotao}>{indicador?.id === item.id ? "Remover quem recomendou" : "Selecionar quem recomendou"}</Text><Text style={styles.gestaoMakerBotaoAjuda}>Aluno que trouxe o novo colega</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.botaoSalvar, indicado?.id === item.id && styles.portalBotaoAtivo]} onPress={() => alternarIndicado(item)}><Text style={styles.textoBotao}>{indicado?.id === item.id ? "Remover quem foi recomendado" : "Selecionar quem foi recomendado"}</Text><Text style={styles.gestaoMakerBotaoAjuda}>Novo aluno que entrou na turma</Text></TouchableOpacity>
            </View>
          </View>)}
        </View>
      </>}
      {aba === "justificativas" && <View style={styles.card}><Text style={styles.areaTitulo}>Justificativas de falta</Text><Text style={styles.legendaTexto}>Leia e decida cada solicitação enviada pelos alunos. Ao aprovar, a falta daquele dia é ajustada.</Text>{justificativas.length === 0 ? <Text style={styles.legendaTexto}>Nenhuma justificativa enviada.</Text> : justificativas.map((item) => <View key={item.id} style={styles.gestaoMakerItem}><Text style={styles.configuracaoTexto}>{item.alunoNome} · {item.data}</Text><Text style={styles.legendaTexto}>{item.texto}</Text>{item.status === "pendente" ? <><TextInput value={comentarioJustificativa} onChangeText={setComentarioJustificativa} style={styles.input} placeholder="Comentário para o aluno (opcional)" /><View style={styles.linhaAcoesPedido}><TouchableOpacity style={[styles.botaoSalvar, styles.botaoPedido]} onPress={() => decidirJustificativa(item, true)}><Text style={styles.textoBotao}>Aprovar</Text></TouchableOpacity><TouchableOpacity style={[styles.botaoSair, styles.botaoPedido]} onPress={() => decidirJustificativa(item, false)}><Text style={styles.textoBotao}>Recusar</Text></TouchableOpacity></View></> : <><Text style={styles.legendaTexto}>Status: {item.status}</Text>{!!item.comentario && <Text style={styles.legendaTexto}>Comentário: {item.comentario}</Text>}</>}</View>)}</View>}
      {aba === "registros" && <><View style={styles.card}><Text style={styles.areaTitulo}>Registros privados</Text><Text style={styles.legendaTexto}>Toque no mesmo aluno novamente para desmarcá-lo.</Text>{alunos.map((item) => <TouchableOpacity key={item.id} onPress={() => selecionarAluno(item)} style={[styles.portalBotao, aluno?.id === item.id && styles.portalBotaoAtivo]}><Text style={styles.configuracaoTexto}>{item.nome}</Text><Text style={styles.legendaTexto}>{aluno?.id === item.id ? "Selecionado — toque para desmarcar" : "Toque para selecionar"}</Text></TouchableOpacity>)}</View>{aluno && <View style={styles.card}><Text style={styles.areaTitulo}>Registro privado: {aluno.nome}</Text><View style={styles.registroMakerConteudo}><Text style={styles.label}>Observação privada</Text><TextInput value={observacao} onChangeText={setObservacao} style={styles.input} placeholder="Escreva uma observação para o professor" /><TouchableOpacity style={styles.botaoEditar} onPress={() => registrar("observacao")}><Text style={styles.textoBotao}>Salvar observação</Text></TouchableOpacity><View style={styles.registroMakerDivisor} /><Text style={styles.areaTitulo}>Observações e histórico</Text>{[...historico.observacoes, ...historico.movimentos].map((item: any) => <Text key={item.id} style={styles.legendaTexto}>• {dataTexto(item.criadoEm)}: {item.texto || item.tipo}</Text>)}</View></View>}</>}
      {aba === "ocorrencias" && <><View style={styles.card}><Text style={styles.areaTitulo}>Ocorrências e multas</Text><Text style={styles.legendaTexto}>Escolha o aluno para registrar uma ocorrência ou consultar as ocorrências já registradas.</Text>{alunos.map((item) => <TouchableOpacity key={item.id} onPress={() => selecionarAluno(item)} style={[styles.portalBotao, aluno?.id === item.id && styles.portalBotaoAtivo]}><Text style={styles.configuracaoTexto}>{item.nome}</Text><Text style={styles.legendaTexto}>Toque para selecionar</Text></TouchableOpacity>)}</View>{aluno && <View style={styles.card}><Text style={styles.areaTitulo}>Ocorrência: {aluno.nome}</Text><View style={styles.registroMakerConteudo}><Text style={styles.label}>Motivo da ocorrência</Text><TextInput value={motivo} onChangeText={setMotivo} style={styles.input} placeholder="Descreva o que aconteceu" /><Text style={styles.label}>Desconto de Maker Coins</Text><TextInput value={multaCoins} onChangeText={setMultaCoins} style={styles.input} keyboardType="numeric" placeholder="Ex.: 2" /><Text style={styles.label}>Desconto de níveis</Text><TextInput value={multaNiveis} onChangeText={setMultaNiveis} style={styles.input} keyboardType="numeric" placeholder="Ex.: 1" /><TouchableOpacity style={styles.botaoSair} onPress={() => registrar("ocorrencia")}><Text style={styles.textoBotao}>Registrar ocorrência</Text></TouchableOpacity><View style={styles.registroMakerDivisor} /><Text style={styles.areaTitulo}>Histórico de ocorrências</Text>{historico.ocorrencias.length === 0 ? <Text style={styles.legendaTexto}>Nenhuma ocorrência registrada para este aluno.</Text> : historico.ocorrencias.map((item: any) => <View key={item.id} style={styles.ocorrenciaHistoricoItem}><Text style={styles.configuracaoTexto}>{dataTexto(item.criadoEm)} · {item.motivo}</Text><Text style={styles.legendaTexto}>Desconto: {item.moedas || 0} coins · {item.niveis || 0} níveis</Text>{!!item.observacao && <Text style={styles.legendaTexto}>{item.observacao}</Text>}</View>)}</View></View>}</>}
    </>}
  </ScrollView>;
}
