import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { SplashLoading } from "./_components/VideoTransition";
import {
    carregarPerfilUsuarioAtual,
    observarUsuarioLogado,
    obterRotaInicialPorPerfil
} from "./utils/authUsuario";

export default function Index() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = observarUsuarioLogado(async (usuario) => {
      if (!usuario) {
        setInitialRoute("/Auth/login");
        setChecked(true);
        return;
      }

      const perfil = await carregarPerfilUsuarioAtual({ criarSeNaoExistir: false });
      const rota = obterRotaInicialPorPerfil(perfil);
      setInitialRoute(rota);
      setChecked(true);
    });

    return unsubscribe;
  }, []);

  if (!checked) {
    return <SplashLoading />;
  }

  return <Redirect href={initialRoute ?? "/Auth/login"} />;
}
