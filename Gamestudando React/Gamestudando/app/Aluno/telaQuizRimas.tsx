import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

import {
    Pressable,
    Text,
    View
} from "react-native";

import {
    useFocusEffect,
    useLocalSearchParams,
    useRouter
} from "expo-router";

import { styles } from "../styles";

import {
    palavrasDireita,
    palavrasEsquerda
} from "../perguntasQuizRimas";
import { carregarQuestoesRimas } from "../utils/repositorioQuestoes";
import { parecemRimar } from "../utils/rimas";

import {
    atualizarPerfil,
    carregarPerfil
} from "../utils/perfilAluno";

import {
    lerTextoSeAtivo,
    pararLeitura
} from "../utils/leituraPerguntas";

// embaralhar
function embaralhar(lista) {

  return [...lista].sort(
    () => Math.random() - 0.5
  );
}

// geração IA
function gerarRodadaIA(nivelAluno = 3, esquerdaBase = palavrasEsquerda, direitaBase = palavrasDireita) {

  let tentativas = 0;

  while (tentativas < 10) {

    const palavrasUsadas = [];

    const esquerdaEscolhida = [];

    const direitaEscolhida = [];

    const pool =
      embaralhar(esquerdaBase);

    for (let esq of pool) {

      const opcoes =
        direitaBase.filter(d =>

          d.grupo === esq.grupo &&
          parecemRimar(esq.texto, d.texto) &&
          d.texto !== esq.texto &&
          !palavrasUsadas.includes(d.texto)

        );

      if (!opcoes.length)
        continue;

      const dir =
        opcoes[
          Math.floor(
            Math.random() *
            opcoes.length
          )
        ];

      esquerdaEscolhida.push(esq);

      direitaEscolhida.push(dir);

      palavrasUsadas.push(esq.texto);

      palavrasUsadas.push(dir.texto);

      if (
        esquerdaEscolhida.length === 5
      ) {
        break;
      }
    }

    if (
      esquerdaEscolhida.length === 5
    ) {

      return {

        esquerda:
          esquerdaEscolhida,

        direita:
          embaralhar(
            direitaEscolhida
          ),
      };
    }

    tentativas++;
  }

  // fallback
  return {

    esquerda:
      esquerdaBase.slice(0, 5),

    direita:
      direitaBase.slice(0, 5),
  };
}

// componente
export default function Index() {

  const router = useRouter();

  const params =
    useLocalSearchParams();

  const faseAtual =
    Array.isArray(params.faseId)
      ? params.faseId[0]
      : params.faseId || "1";

  const finalizandoRef =
    useRef(false);

  const [rodada, setRodada] =
    useState({
      esquerda: [],
      direita: []
    });

  const [
    selecionadoEsquerda,
    setSelecionadoEsquerda
  ] = useState(null);

  const [
    selecionadoDireita,
    setSelecionadoDireita
  ] = useState(null);

  const [acertos,
    setAcertos] = useState([]);

  const [bloqueados,
    setBloqueados] = useState([]);

  const [erro,
    setErro] = useState(false);

  const [bloqueado,
    setBloqueado] = useState(false);

  const [errosFase,
    setErrosFase] = useState(0);

  const progresso =
    acertos.length / 5;

  // recarregar tela
  useFocusEffect(

    useCallback(() => {

      let ativo = true;
      const faseDaRodada = faseAtual;

      // reset geral
      setRodada({
        esquerda: [],
        direita: []
      });

      setSelecionadoEsquerda(null);

      setSelecionadoDireita(null);

      setAcertos([]);

      setBloqueados([]);

      setErro(false);

      setBloqueado(false);

      setErrosFase(0);

      // carregar rodada
      const carregar = async () => {

        try {

          const perfil =
            await carregarPerfil();

          const nivel =
            perfil?.rimas?.nivel || 3;
          const questoesRimas = await carregarQuestoesRimas(
            palavrasEsquerda,
            palavrasDireita
          );

          const novaRodada =
            gerarRodadaIA(
              nivel,
              questoesRimas.esquerda,
              questoesRimas.direita
            );

          if (!ativo || faseDaRodada !== faseAtual) return;

          finalizandoRef.current = false;

          setRodada(novaRodada);

        } catch (err) {

          console.log(
            "Erro carregando:",
            err
          );
        }
      };

      carregar();

      return () => {

        ativo = false;
      };

    }, [faseAtual])

  );

  // ⏳ loading
  const carregando =

    !rodada?.esquerda?.length ||

    !rodada?.direita?.length;

  useEffect(() => {
    if (carregando) return;

    lerTextoSeAtivo("Conecte as palavras que rimam.");

    return () => {
      pararLeitura();
    };
  }, [carregando]);

  // seleção esquerda
  const selecionarEsquerda =
    (item) => {

      if (

        bloqueado ||

        bloqueados.includes(item.id)

      ) return;

      setSelecionadoEsquerda(
        prev =>

          prev?.id === item.id
            ? null
            : item
      );
    };

  // seleção direita
  const selecionarDireita =
    (item) => {

      if (

        bloqueado ||

        bloqueados.includes(item.id)

      ) return;

      setSelecionadoDireita(
        prev =>

          prev?.id === item.id
            ? null
            : item
      );
    };

  // verificar
  const verificar = useCallback(() => {

    if (

      !selecionadoEsquerda ||

      !selecionadoDireita ||

      bloqueado

    ) return;

    setBloqueado(true);

    // acertou
    if (

      selecionadoEsquerda.grupo ===
      selecionadoDireita.grupo &&
      parecemRimar(selecionadoEsquerda.texto, selecionadoDireita.texto)

    ) {

      setBloqueados(prev => [

        ...prev,

        selecionadoEsquerda.id,

        selecionadoDireita.id

      ]);

      setAcertos(prev => [

        ...prev,

        selecionadoEsquerda.grupo

      ]);

      setSelecionadoEsquerda(null);

      setSelecionadoDireita(null);

      setBloqueado(false);

    } else {

      // errou
      setErro(true);

      setErrosFase(
        prev => prev + 1
      );

      setTimeout(() => {

        setErro(false);

        setSelecionadoEsquerda(null);

        setSelecionadoDireita(null);

        setBloqueado(false);

      }, 600);
    }
  }, [
    selecionadoEsquerda,
    selecionadoDireita,
    bloqueado
  ]);

  // auto verificar
  useEffect(() => {

    if (

      selecionadoEsquerda &&

      selecionadoDireita

    ) {

      const timer =
        setTimeout(
          verificar,
          200
        );

      return () =>
        clearTimeout(timer);
    }

  }, [

    selecionadoEsquerda,

    selecionadoDireita,

    verificar

  ]);

  // final da fase
  useEffect(() => {

    if (
      acertos.length === 5 &&
      !finalizandoRef.current
    ) {

      finalizandoRef.current = true;

      const finalizar = async () => {

        try {

          await atualizarPerfil(
            "rimas",
            acertos.length,
            errosFase,
            faseAtual
          );

        } catch (err) {

          console.log(
            "Erro salvando:",
            err
          );
        }

        router.replace({
          pathname: "/Aluno",
          params: {
            faseConcluida:
              String(faseAtual)
          }
        });
      };

      finalizar();
    }

  }, [
    acertos.length,
    errosFase,
    faseAtual,
    router
  ]);

  // ⏳ loading
  if (carregando) {

    return (

      <View style={styles.loadingContainer}>

        <Text>
          Carregando rimas...
        </Text>

      </View>
    );
  }

  // estilos esquerda
  const estiloEsquerda =
    (item) => {

      if (
        bloqueados.includes(item.id)
      ) {

        return styles.itemDesativado;
      }

      if (
        selecionadoEsquerda?.id ===
        item.id
      ) {

        return erro

          ? styles.itemErro

          : styles.itemSelecionado;
      }

      return styles.itemNormal;
    };

  // estilos direita
  const estiloDireita =
    (item) => {

      if (
        bloqueados.includes(item.id)
      ) {

        return styles.itemDesativado;
      }

      if (
        selecionadoDireita?.id ===
        item.id
      ) {

        return erro

          ? styles.itemErro

          : styles.itemSelecionado;
      }

      return styles.itemNormal;
    };

  // UI
  return (

    <View style={styles.rimasContainer}>

      <View style={styles.rimasContent}>

        <Text
          style={
            styles.textoPergunta
          }
        >
          Conecte as rimas
        </Text>

        <Text>
          {acertos.length} / 5
        </Text>

        <View
          style={
            styles.barraContainer
          }
        >

          <View
            style={[

              styles.barraProgresso,

              {
                width:
                  `${progresso * 100}%`
              }

            ]}
          />

        </View>

        <View style={styles.rimasColunas}>

          {/* ESQUERDA */}
          <View style={styles.rimasColuna}>

            {rodada.esquerda.map(
              item => (

              <Pressable

                key={item.id}
                hitSlop={6}
                accessibilityRole="button"

                style={({ pressed }) => [

                  estiloEsquerda(item),

                  pressed && {
                    opacity: 0.8
                  }

                ]}

                onPress={() =>
                  {
                    lerTextoSeAtivo(item.texto);
                    selecionarEsquerda(item);
                  }
                }
              >

                <Text
                  style={
                    styles.texto
                  }
                >
                  {item.texto}
                </Text>

              </Pressable>

            ))}

          </View>

          {/* DIREITA */}
          <View style={styles.rimasColuna}>

            {rodada.direita.map(
              item => (

              <Pressable

                key={item.id}
                hitSlop={6}
                accessibilityRole="button"

                style={({ pressed }) => [

                  estiloDireita(item),

                  pressed && {
                    opacity: 0.8
                  }

                ]}

                onPress={() =>
                  {
                    lerTextoSeAtivo(item.texto);
                    selecionarDireita(item);
                  }
                }
              >

                <Text
                  style={
                    styles.texto
                  }
                >
                  {item.texto}
                </Text>

              </Pressable>

            ))}

          </View>

        </View>

      </View>

    </View>
  );
}
