package com.example.gamestudando;

import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.recyclerview.widget.RecyclerView;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.FirebaseFirestore;

import java.util.List;



public class EstudanteAdapter {
    //Lista de estudante
    private List<Estudante> estudantes;

    //Quando clicar em algum estudante
    public interface OnItemClickListener {
        void onItemClick(Estudante estudante);
    }

    //Função para quando algum estudante for selecionado
    private OnItemClickListener listener;

    //Para saber qual estudante foi selecionado
    public void setOnItemClickListener(OnItemClickListener listener) {
        this.listener = listener;
    }

    //Adaptador do estudante selecionado
    public EstudanteAdapter(List<Estudante> estudantes) {
        this.estudantes = estudantes;
    }

    //Criando uma holder(caixa) para cada estudante
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        //Recebe o layout do item
        View view = LayoutInflater.from(parent.getContext()).inflate(android.R.layout.simple_list_item_2, parent, false);
        return new ViewHolder(view);
    }

    //Agora, posiciona os estudantes na holder
    public void onBindViewHolder(ViewHolder holder, int posicao) {
        //Pega o estudante na posição
        Estudante estudante = estudantes.get(posicao);

        //Pega o nome e o email do estudante
        holder.txt1.setText(estudante.getNome());
        holder.txt2.setText(estudante.getEmail());

        //Caso o usuário clique apenas uma vez
        holder.itemView.setOnClickListener(v ->{
            if (listener != null) {
                listener.onItemClick(estudante);
            }
        });

        //Caso clique duas vezes
        holder.itemView.setOnTouchListener(new View.OnTouchListener() {
            private long ultimoClique = 0;
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                //Seo usuário apertar a tela
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    long cliqueAtual = System.currentTimeMillis();

                    //Se o tempo de clique for menor que 200ms
                    if (cliqueAtual - ultimoClique < 200) {

                    }
                }

                return false;
            }
        });

    }

    //Método para apagar um estudandte
    public void removerEstudante(String idEstudante, int posicao, View view) {
        //Pega o usuário logado
        FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();

        //Ve se o usuário está logado
        if (user != null) {
            String idUsuario = user.getUid();

            //Conecta com o banco e apaga o usuário
            FirebaseFirestore db = FirebaseFirestore.getInstance();

            //Acessa a tabela
            db.collection("Estudantes")
                    //Acessa o documento do usuário
                    .document(idUsuario)
                    //Acessa a coleção de estudantes
                    .collection("Estudantes")
                    //Exclui o estudante
                    .document(idEstudante).delete();
        }

    }



    //Classe para criar um compopnente do view holder
    public class ViewHolder extends RecyclerView.ViewHolder {

        //Recebe o layout do item
        TextView txt1, txt2;
        public ViewHolder(View itemView) {
            super(itemView);
            txt1 = itemView.findViewById(android.R.id.text1);
            txt2 = itemView.findViewById(android.R.id.text2);
        }
    }
}
