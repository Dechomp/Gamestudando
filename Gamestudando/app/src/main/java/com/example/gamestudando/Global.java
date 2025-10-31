package com.example.gamestudando;

import static androidx.core.content.ContextCompat.startActivity;

import android.app.Activity;
import android.content.Intent;
import android.view.View;

public class Global {
    public static String tipoEscolhido = "";

    //Função global para navegação de tela
    public static void navegarTela(View telaAtual, Class telaEscolhida) {
        //Crio um objeto da classe Intent
        Intent proximaTela;

        //Faço o caminho
        proximaTela = new Intent(telaAtual.getContext(), telaEscolhida);

        //Chamo a função que manda para a próxima tela
        startActivity(telaAtual.getContext(), proximaTela, null);

        //Finalizo a tela atual
        if (telaAtual.getContext() instanceof Activity) {
            ((Activity) telaAtual.getContext()).finish();
        }
    }
}
