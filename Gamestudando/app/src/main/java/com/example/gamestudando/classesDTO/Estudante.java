package com.example.gamestudando.classesDTO;

import java.util.Date;

public class Estudante {
    // Atributos
    private String id;
    private String nome;
    private String cpf;
    private Date dataNascimento;
    private String email;
    private Date dataCadastro;
    private String telefone;
    private String status;
    private Boolean isVerificado;
    private String idResponsavel;


    //Primeiro construtor
    public Estudante() {

    }

    //Segundo construtor
    public Estudante(String id, String nome, String cpf, Date dataNascimento, String email, Date dataCadastro, String telefone, String status, Boolean isVerificado, String idResponsavel) {
        this.id = id;
        this.nome = nome;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.email = email;
        this.dataCadastro = dataCadastro;
        this.telefone = telefone;
        this.status = status;
        this.isVerificado = isVerificado;
        this.idResponsavel = idResponsavel;
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

    public Date getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(Date dataNascimento) {
        this.dataNascimento = dataNascimento;
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

    public String getIdResponsavel() {
        return idResponsavel;
    }

    public void setIdResponsavel(String idResponsavel) {
        this.idResponsavel = idResponsavel;
    }
}
