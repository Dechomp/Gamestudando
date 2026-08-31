import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { router, useFocusEffect } from "expo-router";

import { styles } from "../styles";
import { sairDaConta } from "../utils/authUsuario";
import { listarTurmasDoAluno } from "../utils/firebaseTurmas";
import { montarValorQrMaker, obterQrMaker } from "../utils/firebaseMaker";

export default function AguardandoTurmaMaker() {
  const [codigo, setCodigo] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      const turmas = await listarTurmasDoAluno();
      if (turmas.length > 0) {
        router.replace("/Aluno");
        return;
      }
      const resultado = await obterQrMaker();
      setCodigo(resultado.codigo);
    } catch (error) {
      console.log("Erro carregando vínculo Maker:", error);
      Alert.alert("Sala Maker", "Não foi possível preparar seu QR Code agora.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  return (
    <ScrollView style={styles.portalContainer} contentContainerStyle={styles.aguardandoMakerConteudo}>
      <Text style={styles.portalTituloMenor}>Entre na sua Sala Maker</Text>
      <Text style={styles.aguardandoMakerTexto}>
        Antes de usar o app, peça para seu professor abrir a turma, tocar em “Adicionar aluno” e ler este QR Code.
      </Text>

      <View style={styles.aguardandoMakerQrBox}>
        {codigo ? <QRCode value={montarValorQrMaker(codigo)} size={210} /> : <Text>{carregando ? "Preparando QR..." : "QR indisponível"}</Text>}
      </View>
      <Text style={styles.turmaCodigo}>{codigo || "..."}</Text>
      <Text style={styles.aguardandoMakerTexto}>Assim que o professor concluir a inclusão, toque em atualizar para entrar.</Text>

      <View style={styles.aguardandoMakerAcoes}>
        <Text style={styles.aguardandoMakerTexto}>Ou, se o professor mostrar o QR da turma, você pode entrar lendo-o abaixo.</Text>
        <TouchableOpacity style={[styles.botaoEditar, styles.aguardandoMakerBotao]} onPress={() => router.push({ pathname: "/Aluno/LeitorQr", params: { tipo: "turma" } })}>
          <Text style={styles.textoBotao}>Ler QR da turma do professor</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.botaoSalvar, styles.aguardandoMakerBotao]} disabled={carregando} onPress={carregar}>
          <Text style={styles.textoBotao}>Atualizar vínculo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.botaoEditar, styles.aguardandoMakerBotao]} onPress={() => sairDaConta().then(() => router.replace("/Auth/login"))}>
          <Text style={styles.textoBotao}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
