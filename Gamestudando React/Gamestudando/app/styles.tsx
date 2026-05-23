import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({

  // =========================
  // 📦 BASE
  // =========================
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

  // 🔥 NOVO (QUIZ)
  quizContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  // =========================
  // 🔤 TEXTOS
  // =========================
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

  // =========================
  // 🔘 BOTÕES (GERAL)
  // =========================
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

  // =========================
  // ❓ QUIZ - RESPOSTAS
  // =========================
  botaoResposta: {
    flex: 1,
    height: 65,
    margin: 6,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaria,

    minWidth: 140, // 🔥 CONTROLE DE LARGURA

    // 🌑 sombra
    elevation: 4, // Android
    shadowColor: "#000", // iOS
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

  // =========================
  // ✅ BOTÃO CONFIRMAR
  // =========================
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

  // =========================
  // 📊 BARRA DE PROGRESSO
  // =========================
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

  // =========================
  // 🔤 RIMAS
  // =========================
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

  // =========================
  // 🗺️ MAPA
  // =========================
  mapaContainer: {
    padding: 20,
    paddingTop: 56,
    paddingBottom: 60,
  },

  mapaTitulo: {
    fontSize: 26,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },

  mapaIA: {
    textAlign: "center",
    marginBottom: 10,
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

  // =========================
  // 👤 PERFIL
  // =========================
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
    shadowColor: "#000",
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
    shadowColor: "#000",
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
  },

  input: {
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});
