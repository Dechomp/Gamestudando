package com.example.gamestudando.classesDTO;

public class TarefaEntregue {

    private int id;
    private int idTarefa;
    private int idEstudante;
    private String data;
    private boolean acertou;

    // Construtor vazio
    public TarefaEntregue() {
    }

    // Construtor completo (com ID)
    public TarefaEntregue(int id, int idTarefa, int idEstudante, String data, boolean acertou) {
        this.id = id;
        this.idTarefa = idTarefa;
        this.idEstudante = idEstudante;
        this.data = data;
        this.acertou = acertou;
    }

    // Construtor sem ID (para criar nova entrega)
    public TarefaEntregue(int idTarefa, int idEstudante, String data, boolean acertou) {
        this.idTarefa = idTarefa;
        this.idEstudante = idEstudante;
        this.data = data;
        this.acertou = acertou;
    }

    // Getters e Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getIdTarefa() {
        return idTarefa;
    }

    public void setIdTarefa(int idTarefa) {
        this.idTarefa = idTarefa;
    }

    public int getIdEstudante() {
        return idEstudante;
    }

    public void setIdEstudante(int idEstudante) {
        this.idEstudante = idEstudante;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public boolean isAcertou() {
        return acertou;
    }

    public void setAcertou(boolean acertou) {
        this.acertou = acertou;
    }
}
