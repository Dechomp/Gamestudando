package com.example.gamestudando.classesDAO;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import androidx.annotation.Nullable;

import com.example.gamestudando.Global;
import com.example.gamestudando.classesDTO.TarefaEntregue;

import java.util.ArrayList;

public class TarefaEntregueDAO extends SQLiteOpenHelper {

    public static final String NOME_BANCO = "dbGamestudando";
    public static final int VERSAO = Global.versao;

    public static final String NOME_TABELA = "tarefasEntregues";
    public static final String COLUNA_ID = "ent_id";
    public static final String COLUNA_TAR_ID = "tar_id";
    public static final String COLUNA_EST_ID = "est_id";
    public static final String COLUNA_DATA = "ent_data";
    public static final String COLUNA_ACERTOU = "ent_acertou";

    public TarefaEntregueDAO(@Nullable Context context) {
        super(context, NOME_BANCO, null, VERSAO);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Tabela já criada no TarefaDAO
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) { }

    // CREATE
    public void criarEntrega(TarefaEntregue entrega){
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues valores = new ContentValues();
        valores.put(COLUNA_TAR_ID, entrega.getIdTarefa());
        valores.put(COLUNA_EST_ID, entrega.getIdEstudante());
        valores.put(COLUNA_DATA, entrega.getData());
        valores.put(COLUNA_ACERTOU, entrega.isAcertou() ? 1 : 0);

        db.insert(NOME_TABELA, null, valores);

        db.close();
    }

    // READ
    public TarefaEntregue buscarEntrega(int id){
        TarefaEntregue entrega = null;

        String parametro[] = {String.valueOf(id)};
        String campos[] = {COLUNA_ID, COLUNA_TAR_ID, COLUNA_EST_ID, COLUNA_DATA, COLUNA_ACERTOU};

        SQLiteDatabase db = this.getReadableDatabase();

        Cursor cursor = db.query(
                NOME_TABELA,
                campos,
                COLUNA_ID + " = ?",
                parametro,
                null,
                null,
                null
        );

        if(cursor.moveToFirst()){
            entrega = new TarefaEntregue(
                    cursor.getInt(0),
                    cursor.getInt(1),
                    cursor.getInt(2),
                    cursor.getString(3),
                    cursor.getInt(4) == 1
            );
        }

        db.close();
        return entrega;
    }

    // LISTAR por estudante
    public ArrayList<TarefaEntregue> listarEntregasPorEstudante(int estudanteId){
        ArrayList<TarefaEntregue> entregas = new ArrayList<>();
        TarefaEntregue entrega;

        String parametro[] = {String.valueOf(estudanteId)};
        String campos[] = {COLUNA_ID, COLUNA_TAR_ID, COLUNA_EST_ID, COLUNA_DATA, COLUNA_ACERTOU};

        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = null;

        try {
            cursor = db.query(
                    NOME_TABELA,
                    campos,
                    COLUNA_EST_ID + " = ?",
                    parametro,
                    null,
                    null,
                    null
            );
        } catch (Exception ex) {
            Log.e("Erro cursor:", ex.getMessage());
        }

        while(cursor.moveToNext()){
            entrega = new TarefaEntregue(
                    cursor.getInt(0),
                    cursor.getInt(1),
                    cursor.getInt(2),
                    cursor.getString(3),
                    cursor.getInt(4) == 1
            );
            entregas.add(entrega);
        }

        db.close();
        return entregas;
    }

    // LISTAR por tarefa
    public ArrayList<TarefaEntregue> listarEntregasPorTarefa(int tarefaId){
        ArrayList<TarefaEntregue> entregas = new ArrayList<>();
        TarefaEntregue entrega;

        String parametro[] = {String.valueOf(tarefaId)};
        String campos[] = {COLUNA_ID, COLUNA_TAR_ID, COLUNA_EST_ID, COLUNA_DATA, COLUNA_ACERTOU};

        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = null;

        try {
            cursor = db.query(
                    NOME_TABELA,
                    campos,
                    COLUNA_TAR_ID + " = ?",
                    parametro,
                    null,
                    null,
                    null
            );
        } catch (Exception ex){
            Log.e("Erro cursor:", ex.getMessage());
        }

        while(cursor.moveToNext()){
            entrega = new TarefaEntregue(
                    cursor.getInt(0),
                    cursor.getInt(1),
                    cursor.getInt(2),
                    cursor.getString(3),
                    cursor.getInt(4) == 1
            );
            entregas.add(entrega);
        }

        db.close();
        return entregas;
    }

    // UPDATE
    public void atualizarEntrega(TarefaEntregue entrega){
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues valores = new ContentValues();
        valores.put(COLUNA_TAR_ID, entrega.getIdTarefa());
        valores.put(COLUNA_EST_ID, entrega.getIdEstudante());
        valores.put(COLUNA_DATA, entrega.getData());
        valores.put(COLUNA_ACERTOU, entrega.isAcertou() ? 1 : 0);

        String parametro[] = {String.valueOf(entrega.getId())};

        db.update(NOME_TABELA, valores, COLUNA_ID + " = ?", parametro);
        db.close();
    }

    // DELETE
    public void excluirEntrega(int id){
        SQLiteDatabase db = this.getWritableDatabase();

        String parametro[] = {String.valueOf(id)};

        db.delete(NOME_TABELA, COLUNA_ID + " = ?", parametro);

        db.close();
    }
}
