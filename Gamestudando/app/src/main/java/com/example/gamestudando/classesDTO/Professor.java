package com.example.gamestudando.classesDTO;

import java.util.Date;

public class Professor {
    // Atributos
    private String id;
    private String nome;
    private String cpf;
    private String email;
    private Date dataCadastro;
    private String telefone;
    private String formacao;
    private String status;
    private Boolean isVerificado;


    //Primeiro construtor
    public Professor() {

    }

    //Segundo construtor
    public Professor(String id, String nome, String cpf, String email, Date dataCadastro, String telefone, String formacao, String status, Boolean isVerificado) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.email = email;
        this.dataCadastro = dataCadastro;
        this.telefone = telefone;
        this.formacao = formacao;
        this.status = status;
        this.isVerificado = isVerificado;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getFormacao() {
        return formacao;
    }

    public void setFormacao(String formacao) {
        this.formacao = formacao;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(Date dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getVerificado() {
        return isVerificado;
    }

    public void setVerificado(Boolean verificado) {
        isVerificado = verificado;
    }

}
