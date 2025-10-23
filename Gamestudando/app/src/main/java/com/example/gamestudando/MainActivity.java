package com.example.gamestudando;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.Firebase;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {

    //Chamando o banco para a aplicação
    FirebaseFirestore db;
    //Componente de list para o teste
    RecyclerView rcEstudantes;

    //Lista de usuários estudantes
    ArrayList<Estudante> listaEstudantes;

    //Adaptador para o recyclerView
    EstudanteAdapter adapter;

    //Estudante a ser editado
    Estudante estudanteSelecionado = null;



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        //Recebe o usuário logado
        db = FirebaseFirestore.getInstance();

        //Vincula o recyclerView
        rcEstudantes = findViewById(R.id.rcEstudantes);

        //Vincula com um gerador de layout
        rcEstudantes.setLayoutManager(new LinearLayoutManager(this));

        //Relaciona o adapter
        adapter = new EstudanteAdapter(listaEstudantes);

        //Adaptador para o recyclerView
        rcEstudantes.setAdapter(adapter);

      //  carregarEstudantes();






        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}