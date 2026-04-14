import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    margin: 20,
  },

  botaoResposta: {
    flex: 1,
    backgroundColor: "#3245f3",
    padding: 20,
    margin: 5,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoRespostaSelecionada: {
    flex: 1,
    backgroundColor: colors.selecionada,
    padding: 20,
    margin: 5,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoRespostaCerta: {
    flex: 1,
    backgroundColor: colors.certa,
    padding: 20,
    margin: 5,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoRespostaErrada: {
    flex: 1,
    backgroundColor: colors.errada,
    padding: 20,
    margin: 5,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoConfirmarRespostaVazio: {
    width: "100%",
    backgroundColor: colors.confirmarVazio,
    padding: 15,
    marginTop: 50,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoConfirmarRespostaSelecionada: {
    width: "100%",
    backgroundColor: colors.confirmarSelecionada,
    padding: 15,
    marginTop: 50,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoConfirmarRespostaCerta: {
    width: "100%",
    backgroundColor: colors.certa,
    padding: 15,
    marginTop: 50,
    borderRadius: 15,
    alignItems: "center",
  },

  botaoConfirmarRespostaErrada: {
    width: "100%",
    backgroundColor: colors.errada,
    padding: 15,
    marginTop: 50,
    borderRadius: 15,
    alignItems: "center",
  },

  textoBotao: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  textoRodape: {
    fontSize: 20,
    marginTop: 20,
    textAlign: "center",
  },

  textoPergunta: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  barraFundo: {
    width: "100%",
    height: 12,
    backgroundColor: "#ddd",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden", // importante pra não vazar
  },

  barraProgresso: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },

});