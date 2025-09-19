package com.papelaria.vendas.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.papelaria.vendas.controller.VendaRequest;

@Service
public class VendaService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void enviarPedidoDeVenda(VendaRequest vendaRequest) {
        System.out.println("Enviando pedido de venda para a fila.");
        rabbitTemplate.convertAndSend("vendas_pendentes", vendaRequest);
    }
}