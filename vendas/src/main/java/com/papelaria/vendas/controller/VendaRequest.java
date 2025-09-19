package com.papelaria.vendas.controller;

import java.io.Serializable;
import java.util.List;

public class VendaRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long clienteId;
    private List<Long> produtoIds;

    // Getters and setters
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public List<Long> getProdutoIds() { return produtoIds; }
    public void setProdutoIds(List<Long> produtoIds) { this.produtoIds = produtoIds; }
}