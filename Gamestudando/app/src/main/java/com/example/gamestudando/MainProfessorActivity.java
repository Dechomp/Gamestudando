package com.example.gamestudando;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.gamestudando.classesDTO.Estudante;
import com.example.gamestudando.classesDTO.Professor;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.FirebaseFirestore;

public class MainProfessorActivity extends AppCompatActivity {

    //Crio o banco de dados
    FirebaseFirestore db;

    FirebaseUser user = null;

    //Componentes
    TextView tvNome;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main_professor);

        //Vinculando os componentes
        tvNome = findViewById(R.id.tvNomeProfessorLogado);

        //Chamo o banco de dados e pega o usuário logado
        db = FirebaseFirestore.getInstance();

        //Recebe o usuário logado
        user = FirebaseAuth.getInstance().getCurrentUser();

        //Procuro os dados e o recebo
        db.collection("Professor")
                //Procuro pelo id do usuário logado
                .document(user.getUid())
                //Pego os dados do professor
                .get()
                //Caso de certo
                .addOnSuccessListener(doc -> {
                    //Caso não venha vazio
                    if (doc.exists()) {
                        //Pego as informações do professor
                        Professor professor= doc.toObject(Professor.class);

                        //Defino os textos
                        tvNome.setText(professor.getNome());

                    }
                    //Se não tiver nenhum professor (Mas quase certeza que é outro tipo de BUG)
                    else {
                        //Mostro a mensagem
                        Toast.makeText(this, "Usuário não encontrado", Toast.LENGTH_SHORT).show();
                    }
                })
                //Se der erraao
                .addOnFailureListener(e ->{
                    //Mostro a mensagem de erro
                    Toast.makeText(this, "Erro ao buscar o professor", Toast.LENGTH_SHORT).show();
                });







        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }
}