package com.example.gamestudando;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class EscolherCadastroActivity extends AppCompatActivity {

    Button btEscolherEstudante, btEscolherProfessor, btEscolherEscola, btEscolherResponsavel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_escolher_cadastro);

        btEscolherEstudante = findViewById(R.id.btEscolherEstudante);
        btEscolherProfessor = findViewById(R.id.btEscolherProfessor);
        btEscolherEscola = findViewById(R.id.btEscolherEscola);
        btEscolherResponsavel = findViewById(R.id.btEscolherResponsavel);

        btEscolherEstudante.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent telaCadastroPessoa;
                telaCadastroPessoa = new Intent(EscolherCadastroActivity.this, CadastroPessoaActivity.class);

                startActivity(telaCadastroPessoa);
                finish();

            }
        });


        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}