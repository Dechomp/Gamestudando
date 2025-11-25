package com.example.gamestudando;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class MenuEscolhaActivity extends AppCompatActivity {

    //Declaração dos botões
    Button btEscolherTestePortugues, btEscolherTesteMatematica;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_menu_escolha);

        //Vincular os componentes
        btEscolherTestePortugues = findViewById(R.id.btEscolherTestePortugues);
        btEscolherTesteMatematica = findViewById(R.id.btEscolherTesteMatematica);

        //Quando clicar para escolher o teste de Portugues
        btEscolherTestePortugues.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Salva que o teste é de português
                Global.testeEscolhido = "Portugues";

                //Chama a função global de navegação de tela
            }
        });

        //Quando clicar para escolher o teste de Matemática
        btEscolherTesteMatematica.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //Salva que o teste é de Matemática
                Global.testeEscolhido = "Matematica";

                //Chama a função global de navegação de tela
            }
        });


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}