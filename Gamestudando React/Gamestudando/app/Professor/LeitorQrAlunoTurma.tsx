import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { styles } from "../styles";
import { adicionarAlunoNaTurmaPorCodigo } from "../utils/firebaseTurmas";

export default function LeitorQrAlunoTurma() {
  const params = useLocalSearchParams(); const turmaId = Array.isArray(params.turmaId) ? params.turmaId[0] : params.turmaId;
  const [processando, setProcessando] = useState(false); const [permission, requestPermission] = useCameraPermissions();
  const voltar = () => turmaId ? router.replace({ pathname: "/Professor/DetalhesTurma", params: { id: turmaId } }) : router.replace("/Professor/RelatorioProfessor");
  const ler = async ({ data }) => { if (processando || !turmaId) return; try { setProcessando(true); await adicionarAlunoNaTurmaPorCodigo(turmaId, data, { nivelAtual: params.nivel, moedasAtuais: params.moedas }); Alert.alert("Turma", "Aluno adicionado à turma.", [{ text: "OK", onPress: voltar }]); } catch (error) { setProcessando(false); Alert.alert("QR Code", mensagemErro(error)); } };
  if (!permission?.granted) return <View style={styles.leitorQrTela}><Text style={styles.leitorQrTitulo}>Ler QR do aluno</Text><TouchableOpacity style={styles.botaoSalvar} onPress={requestPermission}><Text style={styles.textoBotao}>Permitir câmera</Text></TouchableOpacity><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Voltar</Text></TouchableOpacity></View>;
  return <View style={styles.leitorQrTela}><CameraView style={styles.leitorQrCamera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={processando ? undefined : ler} /><View style={styles.leitorQrRodape}><Text style={styles.leitorQrTitulo}>Ler QR do aluno</Text><Text style={styles.leitorQrTexto}>{processando ? "Adicionando..." : "Aponte a câmera para o QR Code."}</Text><TouchableOpacity style={styles.botaoSair} onPress={voltar}><Text style={styles.textoBotao}>Cancelar</Text></TouchableOpacity></View></View>;
}

function mensagemErro(error) {
  const mensagem = error?.message || "";
  if (mensagem.includes("ALUNO_NAO_ENCONTRADO")) return "Este QR não pertence a um aluno ativo. Peça ao aluno para abrir a tela de espera e tocar em Atualizar vínculo antes de tentar novamente.";
  if (mensagem.includes("permission-denied")) return "Sem permissão para adicionar aluno. Atualize as regras do Firestore publicadas.";
  return `Não foi possível adicionar o aluno. ${mensagem || "Tente novamente."}`;
}
