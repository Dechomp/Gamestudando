import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({

  // BASE
  container: {
    flex: 1,
    padding: 20,
  },

  telaComTopoSeguro: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  telaFlex: {
    flex: 1,
  },

  legadoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // NOVO (QUIZ)
  quizContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // TEXTOS
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  texto: {
    color: colors.branco,
    fontWeight: "bold",
  },

  textoPergunta: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  textoRodape: {
    fontSize: 18,
    marginTop: 20,
    textAlign: "center",
  },

  textoBotao: {
    color: colors.branco,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  textoPequeno: {
    fontSize: 14,
  },

  perfilTitulo: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },

  perfilNome: {
    marginBottom: 15,
  },

  loadingText: {
    fontSize: 16,
  },

  resultadoTexto: {
    marginTop: 10,
  },

  legendaTexto: {
    fontSize: 14,
  },

  // BOTÕES (GERAL)
  botaoBase: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoPrimario: {
    backgroundColor: colors.primaria,
  },

  botaoSecundario: {
    backgroundColor: colors.secundaria,
  },

  botaoSucesso: {
    backgroundColor: colors.certa,
  },

  botaoErro: {
    backgroundColor: colors.errada,
  },

  botaoDesabilitado: {
    backgroundColor: colors.cinza,
  },

  botaoSalvar: {
    backgroundColor: colors.certa,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },

  botaoResetar: {
    backgroundColor: colors.errada,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  quizLegacyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },

  quizRespostasLinha: {
    flexDirection: "row",
  },

  quizRespostasLinhaEspacada: {
    flexDirection: "row",
    marginTop: 20,
  },

  botaoSair: {
    backgroundColor: colors.errada,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoEditar: {
    backgroundColor: colors.secundaria,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  botaoFirebaseTeste: {
    width: "100%",
    maxWidth: 420,
    marginTop: 10,
  },

  botaoPerfilEspacado: {
    width: "100%",
    maxWidth: 420,
    marginTop: 10,
  },

  botaoTexto: {
    color: colors.branco,
    fontWeight: "bold",
  },

  botaoReset: {
    alignItems: "center",
    marginBottom: 20,
  },

  textoReset: {
    fontWeight: "bold",
  },

  // QUIZ - RESPOSTAS
  botaoResposta: {
    flex: 1,
    height: 65,
    margin: 6,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaria,

    minWidth: 140, //  CONTROLE DE LARGURA

    // sombra
    elevation: 4, // Android
    shadowColor: colors.preto, // iOS
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  botaoRespostaSelecionada: {
    flex: 1,
    height: 65,
    margin: 6,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.selecionada,
    minWidth: 140,
    elevation: 4,
  },

  botaoRespostaCerta: {
    flex: 1,
    height: 65,
    margin: 6,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.certa,
    minWidth: 140,
    elevation: 4,
  },

  botaoRespostaErrada: {
    flex: 1,
    height: 65,
    margin: 6,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.errada,
    minWidth: 140,
    elevation: 4,
  },

  // Botao de confirmar
  botaoConfirmarBase: {
    width: "90%",
    padding: 15,
    marginTop: 40,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoConfirmarVazio: {
    backgroundColor: colors.confirmarVazio,
  },

  botaoConfirmarSelecionado: {
    backgroundColor: colors.confirmarSelecionada,
  },

  botaoConfirmarCerto: {
    backgroundColor: colors.certa,
  },

  botaoConfirmarErrado: {
    backgroundColor: colors.errada,
  },

  botaoFinalizar: {
    backgroundColor: colors.secundaria,
  },

  matematicaContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 90,
  },

  matematicaContent: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
  },

  matematicaRespostasLinha: {
    flexDirection: "row",
    width: "100%",
  },

  matematicaRespostaWrapper: {
    width: "50%",
    padding: 6,
  },

  botaoRespostaMatematica: {
    flex: 0,
    width: "100%",
    minWidth: 0,
    minHeight: 70,
    height: "auto",
    paddingHorizontal: 10,
  },

  botaoConfirmarMatematica: {
    width: "100%",
    maxWidth: 420,
    marginTop: 28,
  },

  // BARRA DE PROGRESSO
  barraContainer: {
    width: "90%",
    height: 20,
    backgroundColor: colors.fundoBarra,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },

  barraProgresso: {
    height: "100%",
    backgroundColor: colors.certa,
  },

  // RIMAS
  rimasContainer: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  rimasContent: {
    width: "100%",
    maxWidth: 520,
    alignItems: "center",
  },

  rimasColunas: {
    flexDirection: "row",
    marginTop: 20,
    width: "100%",
    justifyContent: "center",
    gap: 10,
  },

  rimasColuna: {
    flex: 1,
    alignItems: "center",
  },

  itemNormal: {
    backgroundColor: colors.primaria,

    paddingVertical: 15,
    paddingHorizontal: 15,

    margin: 5,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 60,

    width: "100%",
    maxWidth: 220,
  },

  itemSelecionado: {
    backgroundColor: colors.selecionada,

    paddingVertical: 15,
    paddingHorizontal: 15,

    margin: 5,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 60,

    width: "100%",
    maxWidth: 220,
  },

  itemErro: {
    backgroundColor: colors.errada,

    paddingVertical: 15,
    paddingHorizontal: 15,

    margin: 5,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 60,

    width: "100%",
    maxWidth: 220,
  },

  itemDesativado: {
    backgroundColor: colors.cinza,

    paddingVertical: 15,
    paddingHorizontal: 15,

    margin: 5,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 60,

    width: "100%",
    maxWidth: 220,
  },

  // MAPA
  mapaContainer: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 60,
  },

  mapaTitulo: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },

  mapaTrilhas: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 10,
  },

  mapaTrilhaBotao: {
    backgroundColor: colors.cinzaClaro,
    borderColor: colors.cinza,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  mapaTrilhaBotaoAtivo: {
    backgroundColor: colors.secundaria,
    borderColor: colors.secundaria,
  },

  mapaTrilhaTexto: {
    color: colors.preto,
    fontSize: 13,
    fontWeight: "bold",
  },

  mapaTrilhaTextoAtivo: {
    color: colors.branco,
  },

  roletaArea: {
    alignItems: "center",
    height: 270,
    justifyContent: "center",
    overflow: "hidden",
  },
  roletaDisco: {
    alignItems: "center",
    backgroundColor: "#164e63",
    borderColor: colors.secundaria,
    borderRadius: 120,
    borderWidth: 7,
    elevation: 5,
    height: 240,
    justifyContent: "center",
    overflow: "hidden",
    width: 240,
  },
  roletaAnelInterno: {
    borderColor: "#0e7490",
    borderRadius: 98,
    borderWidth: 20,
    height: 196,
    opacity: 0.7,
    position: "absolute",
    width: 196,
  },
  roletaOpcao: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 30,
    paddingHorizontal: 4,
    paddingVertical: 3,
    position: "absolute",
  },
  roletaOpcaoSorteada: {
    backgroundColor: "#fef3c7",
    borderColor: colors.laranja,
    borderWidth: 3,
  },
  roletaOpcaoTexto: {
    color: "#164e63",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  roletaOpcaoTextoSorteada: { color: "#92400e" },
  roletaCentro: {
    alignItems: "center",
    backgroundColor: colors.secundaria,
    borderColor: colors.branco,
    borderRadius: 32,
    borderWidth: 4,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  roletaCentroTexto: { color: colors.branco, fontSize: 28, fontWeight: "bold" },
  roletaPonteiro: {
    color: colors.errada,
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: -10,
    zIndex: 2,
  },
  roletaResultado: {
    color: colors.primaria,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },

  roletaTipoGrade: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
    width: "100%",
  },

  roletaTipoBotao: {
    backgroundColor: colors.cinzaMuitoClaro,
    borderColor: colors.cinzaClaro,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 118,
    padding: 12,
    width: "48%",
  },

  roletaTipoBotaoAtivo: {
    backgroundColor: colors.secundaria,
    borderColor: colors.secundaria,
  },

  roletaTipoTitulo: {
    color: colors.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  roletaTipoDescricao: {
    color: colors.textoSecundario,
    fontSize: 12,
    lineHeight: 17,
  },

  roletaSalvaItem: {
    borderBottomColor: colors.cinzaClaro,
    borderBottomWidth: 1,
    marginBottom: 14,
    paddingBottom: 14,
    width: "100%",
  },

  mapaMundoTitulo: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.primaria,
    marginBottom: 2,
  },

  mapaMundoHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 12,
  },

  mapaMundoCentro: {
    flex: 1,
    maxWidth: 430,
    alignItems: "center",
  },

  mapaMundoNome: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.preto,
    marginBottom: 6,
  },

  mapaMundoSubtitulo: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 0,
  },

  mapaMundoBotoes: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 12,
  },

  botaoMundo: {
    backgroundColor: colors.secundaria,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },

  botaoMundoCircular: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secundaria,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoMundoDesabilitado: {
    backgroundColor: colors.cinza,
  },

  textoMundoSeta: {
    color: colors.branco,
    fontSize: 34,
    fontWeight: "bold",
    lineHeight: 38,
  },

  mapaIA: {
    textAlign: "center",
    marginBottom: 10,
  },

  mapaMissaoEspacialBotao: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 360,
    marginBottom: 18,
  },

  faseContainer: {
    alignItems: "center",
  },

  faseWrapper: {
    marginVertical: 20,
  },

  faseEsquerda: {
    alignSelf: "flex-start",
  },

  faseDireita: {
    alignSelf: "flex-end",
  },

  botaoFase: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  faseLiberada: {
    backgroundColor: colors.certa,
  },

  faseBloqueada: {
    backgroundColor: colors.cinza,
  },

  textoFase: {
    color: colors.branco,
    fontSize: 22,
    fontWeight: "bold",
  },

  linhaFases: {
    width: 4,
    height: 50,
    backgroundColor: colors.cinzaClaro,
    borderRadius: 2,
  },

  // PERFIL
  perfilContainer: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 90,
    alignItems: "center",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
    elevation: 3,
    shadowColor: colors.preto,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  areaTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },

  graficoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },

  porcentagem: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  legendaContainer: {
    width: "100%",
    marginTop: 14,
    alignItems: "center",
  },

  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },

  legendaCor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
  },

  legendaAcerto: {
    backgroundColor: colors.certa,
  },

  legendaErro: {
    backgroundColor: colors.errada,
  },

  portalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
    backgroundColor: colors.branco,
  },

  portalContent: {
    paddingBottom: 100,
  },

  portalTitulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.secundaria,
    marginBottom: 30,
    textAlign: "center",
  },

  portalTituloMenor: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.textoPrimario,
  },

  portalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    color: colors.textoPrimario,
  },

  portalValor: {
    fontSize: 18,
    color: colors.textoSecundario,
    marginTop: 5,
  },

  portalItemLista: {
    fontSize: 17,
    color: colors.textoSecundario,
    marginTop: 5,
    marginLeft: 10,
  },

  portalBotao: {
    padding: 15,
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 5,
    marginBottom: 5,
  },

  portalBotaoAtivo: {
    backgroundColor: colors.cinza,
    borderWidth: 1,
    borderColor: colors.secundaria,
  },

  portalBotaoAluno: {
    padding: 12,
    backgroundColor: colors.fundoCampo,
    marginLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: colors.azulBorda,
    marginBottom: 5,
  },

  portalSecao: {
    marginTop: 20,
  },

  portalQuadroRelatorio: {
    marginTop: 30,
    padding: 20,
    backgroundColor: colors.fundoInfo,
    borderRadius: 10,
  },

  portalQuadroDetalhes: {
    marginTop: 30,
    padding: 20,
    borderTopWidth: 1,
    borderColor: colors.cinzaClaro,
  },

  portalSubtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  portalBotaoCrianca: {
    padding: 15,
    backgroundColor: colors.cinzaMuitoClaro,
    marginBottom: 10,
    borderRadius: 8,
  },

  portalNomeCrianca: {
    fontSize: 18,
    color: colors.textoPrimario,
  },

  configuracaoCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: colors.preto,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  configuracaoTexto: {
    fontSize: 16,
    fontWeight: "bold",
  },

  editarTitulo: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.textoPrimario,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: colors.textoPrimario,
    backgroundColor: colors.fundoCampo,
  },

  campoJustificativaFalta: {
    alignSelf: "stretch",
    marginHorizontal: -6,
  },

  botaoJustificativaFalta: {
    alignSelf: "stretch",
    marginHorizontal: -6,
  },

  makerListaRegras: {
    gap: 10,
    marginTop: 12,
    width: "100%",
  },

  makerRegraItem: {
    alignItems: "flex-start",
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },

  makerRegraNumero: {
    backgroundColor: colors.secundaria,
    borderRadius: 14,
    color: colors.branco,
    fontWeight: "bold",
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: "center",
  },

  makerRegraTexto: {
    color: colors.textoPrimario,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  makerResumoGrade: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
  },

  makerResumoBloco: {
    alignItems: "center",
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 10,
    minHeight: 92,
    justifyContent: "center",
    padding: 12,
    width: "48%",
  },

  makerResumoBlocoLargo: {
    width: "100%",
  },

  makerResumoRotulo: {
    color: colors.textoSecundario,
    fontSize: 13,
    textAlign: "center",
  },

  makerResumoValor: {
    color: colors.secundaria,
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 5,
  },

  makerInformacaoBloco: {
    alignSelf: "stretch",
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 10,
    marginBottom: 10,
    padding: 13,
  },

  makerInformacaoTitulo: {
    color: colors.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  makerInformacaoTexto: {
    color: colors.textoSecundario,
    fontSize: 14,
    lineHeight: 20,
  },

  tarefaScroll: {
    flex: 1,
    backgroundColor: colors.branco,
  },

  tarefaContent: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 100,
  },

  linhaAcoes: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 16,
  },

  botaoAcaoFlex: {
    flex: 1,
  },

  linhaAcoesPedido: {
    alignItems: "stretch",
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    width: "100%",
  },

  botaoPedido: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 0,
    minHeight: 48,
  },

  seletorCriacaoContainer: {
    flexDirection: "row",
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 8,
    padding: 4,
    marginBottom: 22,
  },

  seletorCriacaoBotao: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  seletorCriacaoAtivo: {
    backgroundColor: colors.card,
    elevation: 2,
    shadowColor: colors.preto,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },

  seletorCriacaoTexto: {
    color: colors.textoSecundario,
    fontWeight: "bold",
  },

  seletorCriacaoTextoAtivo: {
    color: colors.secundaria,
  },

  turmaQrCard: {
    alignItems: "center",
    backgroundColor: colors.fundoInfo,
    borderRadius: 8,
    padding: 18,
    marginTop: 18,
  },

  turmaCodigo: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textoPrimario,
    marginBottom: 14,
  },

  turmaQrBox: {
    alignSelf: "center",
    backgroundColor: colors.branco,
    padding: 12,
    borderRadius: 8,
    marginVertical: 14,
  },

  turmaAlunoItem: {
    width: "100%",
    backgroundColor: colors.fundoCampo,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  relatorioMateriaLinha: {
    backgroundColor: colors.branco,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  qrScannerContainer: {
    marginTop: 20,
    marginBottom: 20,
  },

  qrScanner: {
    width: "100%",
    height: 260,
    borderRadius: 8,
    overflow: "hidden",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    backgroundColor: colors.fundoCampo,
  },

  pickerContainerEspacado: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    backgroundColor: colors.fundoCampo,
    marginTop: 10,
    marginBottom: 18,
  },

  inputPergunta: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    backgroundColor: colors.fundoCampo,
  },

  linhaAlternativa: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  letra: {
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },

  inputAlternativa: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: colors.fundoCampo,
  },

  contador: {
    textAlign: "center",
    fontSize: 16,
    color: colors.textoAuxiliar,
    marginBottom: 30,
  },

  tarefaRespostaCorretaCard: {
    borderColor: colors.certa,
    borderWidth: 2,
  },

  tarefaRespostaCorretaTexto: {
    color: colors.certa,
    fontWeight: "bold",
    marginTop: 5,
  },

  botaoVoltarTarefa: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 12,
  },

  textoVoltarTarefa: {
    color: colors.secundaria,
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoEditarTarefa: {
    backgroundColor: colors.laranja,
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },

  botaoExcluirTarefa: {
    backgroundColor: colors.errada,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  authKeyboard: {
    flex: 1,
  },

  authContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 72,
    paddingBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  authCard: {
    width: "100%",
    maxWidth: 420,
  },

  authTitulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  authSubtitulo: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },

  authBotaoPrincipal: {
    backgroundColor: colors.primaria,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },

  authBotaoGoogle: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: colors.branco,
  },

  authBotaoGoogleTexto: {
    color: colors.preto,
    fontWeight: "bold",
  },

  googleIcone: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.branco,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  googleIconeTexto: {
    color: colors.primaria,
    fontSize: 16,
    fontWeight: "bold",
  },

  authLinkBotao: {
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },

  authLinkBotaoSecundario: {
    alignItems: "flex-end",
    marginTop: -8,
    marginBottom: 12,
  },

  authLinkTexto: {
    color: colors.primaria,
    fontWeight: "bold",
  },

  senhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: colors.fundoCampo,
  },

  inputSenha: {
    flex: 1,
    padding: 12,
    color: colors.textoPrimario,
    backgroundColor: colors.fundoCampo,
  },

  botaoMostrarSenha: {
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  textoMostrarSenha: {
    color: colors.primaria,
    fontWeight: "bold",
  },

  tipoContaContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },

  tipoContaBotao: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.branco,
  },

  tipoContaBotaoSelecionado: {
    backgroundColor: colors.primaria,
    borderColor: colors.primaria,
  },

  tipoContaTexto: {
    color: colors.preto,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
  },

  tipoContaTextoSelecionado: {
    color: colors.branco,
  },

  avaliacaoContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 56,
    paddingBottom: 90,
    alignItems: "center",
    justifyContent: "center",
  },

  avaliacaoTitulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },

  avaliacaoProgresso: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },

  avaliacaoRespostas: {
    width: "100%",
    maxWidth: 520,
  },

  avaliacaoBotaoResposta: {
    backgroundColor: colors.primaria,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    minHeight: 56,
    justifyContent: "center",
  },

  avaliacaoBotaoSelecionado: {
    backgroundColor: colors.selecionada,
  },

  avaliacaoBotaoCorreto: {
    backgroundColor: colors.certa,
  },

  avaliacaoBotaoErrado: {
    backgroundColor: colors.errada,
  },

  avaliacaoFeedbackCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.fundoInfo,
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    alignItems: "center",
  },

  missaoContainer: {
    flex: 1,
    backgroundColor: colors.espacoFundo,
  },

  missaoFundoImagem: {
    position: "absolute",
  },

  missaoCanvas: {
    flex: 1,
  },

  missaoSpriteTerra: {
    position: "absolute",
    width: 84,
    height: 84,
  },

  missaoSpriteAsteroide: {
    position: "absolute",
  },

  missaoSpriteNave: {
    position: "absolute",
    width: 60,
    height: 72,
  },

  missaoSpriteLaser: {
    position: "absolute",
    width: 18,
    height: 46,
  },

  missaoSpritePickup: {
    position: "absolute",
    width: 44,
    height: 52,
  },

  missaoUpgradePickup: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.palavraAtual,
    borderWidth: 2,
    borderColor: colors.branco,
    alignItems: "center",
    justifyContent: "center",
  },

  missaoUpgradePickupTexto: {
    color: colors.espacoFundo,
    fontSize: 14,
    fontWeight: "bold",
  },

  missaoTouchArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  missaoHudTopo: {
    position: "absolute",
    top: 46,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  missaoHudBloco: {
    backgroundColor: colors.hudJogo,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 138,
  },

  missaoHudTexto: {
    color: colors.branco,
    fontSize: 15,
    fontWeight: "bold",
  },

  missaoObjetoLabel: {
    color: colors.branco,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: colors.preto,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  missaoFuelBarra: {
    width: 126,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.palavraFutura,
    overflow: "hidden",
    marginVertical: 5,
  },

  missaoFuelBarraPreenchida: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: colors.combustivel,
  },

  missaoVidasLinha: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },

  missaoVidaNave: {
    width: 20,
    height: 24,
  },

  missaoVidaNaveApagada: {
    opacity: 0.35,
  },

  missaoPauseBotao: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.laranja,
    alignItems: "center",
    justifyContent: "center",
  },

  missaoPauseTexto: {
    color: colors.branco,
    fontSize: 22,
    fontWeight: "bold",
  },

  missaoPensamento: {
    position: "absolute",
    top: 118,
    left: 24,
    right: 24,
    alignItems: "center",
  },

  missaoPensamentoTexto: {
    color: colors.branco,
    backgroundColor: colors.hudJogo,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    textAlign: "center",
    overflow: "hidden",
  },

  missaoPalavra: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 26,
    alignItems: "center",
  },

  missaoPalavraLinha: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
  },

  missaoLetraSlot: {
    width: 34,
    alignItems: "center",
  },

  missaoLetraTexto: {
    fontSize: 32,
    fontWeight: "bold",
  },

  missaoIndicadorLetra: {
    color: colors.palavraAtual,
    fontSize: 16,
    lineHeight: 16,
    fontWeight: "bold",
  },

  missaoControleArea: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 106,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  missaoDirecional: {
    width: 178,
    alignItems: "center",
    justifyContent: "center",
  },

  missaoDirecionalLinha: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },

  missaoControleGrupo: {
    flexDirection: "row",
    gap: 12,
  },

  missaoControleDica: {
    minWidth: 132,
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: colors.hudJogo,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  missaoControleDicaGrupo: {
    minWidth: 178,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  missaoPararBotao: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.controleJogo,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.laranja,
  },

  missaoControleDicaTexto: {
    color: colors.branco,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },

  missaoControleBotao: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.controleJogo,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.palavraFutura,
  },

  missaoControleBotaoGrande: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  missaoControleBotaoAtivo: {
    backgroundColor: colors.controleJogoAtivo,
    borderColor: colors.laranja,
  },

  missaoControleTexto: {
    color: colors.branco,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

  missaoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  missaoOverlayBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.hudJogo,
    borderRadius: 8,
    padding: 22,
    alignItems: "center",
  },

  missaoOverlayTitulo: {
    color: colors.branco,
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  missaoOverlayProgresso: {
    color: colors.palavraAtual,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
  },

  missaoOverlayTexto: {
    color: colors.branco,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
  },

  missaoModoControleBox: {
    width: "100%",
    marginBottom: 8,
  },

  missaoModoControleLinha: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },

  missaoModoControleBotao: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.palavraFutura,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.controleJogo,
    paddingHorizontal: 6,
  },

  missaoModoControleBotaoAtivo: {
    backgroundColor: colors.controleJogoAtivo,
    borderColor: colors.laranja,
  },

  missaoModoControleTexto: {
    color: colors.branco,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },

  missaoOverlayBotao: {
    width: "100%",
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.laranja,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  missaoOverlayBotaoSecundario: {
    backgroundColor: colors.secundaria,
  },

  navegacaoMesFaltas: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },

  turmaMakerAcoes: {
    gap: 10,
    marginTop: 14,
  },

  turmaMakerAcao: {
    borderRadius: 12,
    minHeight: 78,
    padding: 14,
  },

  turmaMakerAcaoPresenca: {
    backgroundColor: colors.certa,
  },

  turmaMakerAcaoGestao: {
    backgroundColor: colors.secundaria,
  },

  turmaMakerAcaoDinamicas: {
    backgroundColor: colors.laranja,
  },

  turmaMakerAcaoTitulo: {
    color: colors.branco,
    fontSize: 17,
    fontWeight: "bold",
  },

  turmaMakerAcaoDescricao: {
    color: colors.branco,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },

  leitorQrTela: {
    backgroundColor: colors.preto,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  leitorQrCamera: {
    flex: 1,
    marginHorizontal: -20,
  },

  leitorQrRodape: {
    backgroundColor: colors.branco,
    marginHorizontal: -20,
    padding: 20,
  },

  leitorQrTitulo: {
    color: colors.textoPrimario,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  leitorQrTexto: {
    color: colors.textoPrimario,
    fontSize: 16,
    marginVertical: 12,
    textAlign: "center",
  },

  aguardandoMakerConteudo: {
    alignItems: "center",
    flexGrow: 1,
    minHeight: "100%",
    padding: 20,
    paddingTop: 56,
    // Espaço extra garante que os botões finais sejam alcançáveis em telas menores.
    paddingBottom: 160,
  },

  aguardandoMakerTexto: {
    color: colors.textoSecundario,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },

  aguardandoMakerQrBox: {
    alignItems: "center",
    backgroundColor: colors.branco,
    borderColor: colors.cinzaClaro,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 22,
    padding: 18,
  },

  aguardandoMakerAcoes: {
    gap: 14,
    marginTop: 26,
    width: "100%",
  },

  aguardandoMakerBotao: {
    marginTop: 0,
    minHeight: 50,
  },

  gestaoMakerAbas: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
    width: "100%",
  },

  gestaoMakerAba: {
    alignItems: "center",
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 10,
    width: "48%",
    minHeight: 48,
    paddingHorizontal: 6,
    paddingVertical: 12,
  },

  gestaoMakerAbaAtiva: {
    backgroundColor: colors.secundaria,
  },

  gestaoMakerAbaTexto: {
    color: colors.textoPrimario,
    fontWeight: "bold",
  },

  gestaoMakerAbaTextoAtivo: {
    color: colors.branco,
  },

  gestaoMakerItem: {
    borderBottomColor: colors.cinzaClaro,
    borderBottomWidth: 1,
    marginBottom: 18,
    paddingBottom: 16,
  },

  gestaoMakerGrupo: {
    borderTopColor: colors.cinzaClaro,
    borderTopWidth: 1,
    gap: 8,
    marginTop: 22,
    paddingTop: 18,
  },

  gestaoMakerBotaoAjuda: {
    color: colors.branco,
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },

  gestaoMakerAcoesVerticais: {
    gap: 10,
    marginTop: 10,
  },

  indicacaoSelecionada: {
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 8,
    color: colors.textoPrimario,
    marginBottom: 14,
    padding: 12,
  },

  registroMakerConteudo: {
    alignSelf: "stretch",
  },

  registroMakerDivisor: {
    borderTopColor: colors.cinzaClaro,
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 18,
  },

  ocorrenciaHistoricoItem: {
    backgroundColor: colors.cinzaMuitoClaro,
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },

  faseEscolarGrupo: {
    alignItems: "center",
  },

  faseMateriasLinha: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },

  faseMateriaBotao: {
    backgroundColor: colors.secundaria,
    borderRadius: 10,
    minWidth: 84,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },

  faseMateriaBotaoBloqueado: {
    backgroundColor: colors.cinza,
  },

  faseMateriaTexto: {
    color: colors.branco,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  setaMesFaltas: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secundaria,
  },

  setaMesFaltasBloqueada: {
    backgroundColor: colors.cinzaClaro,
  },

  setaMesFaltasTexto: {
    color: colors.branco,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "bold",
  },

  setaMesFaltasTextoBloqueada: {
    color: colors.cinza,
  },

  nomeMesFaltas: {
    flex: 1,
    marginHorizontal: 28,
    color: colors.textoPrimario,
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
    textAlign: "center",
  },

  missaoOverlayBotaoTexto: {
    color: colors.branco,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

});
