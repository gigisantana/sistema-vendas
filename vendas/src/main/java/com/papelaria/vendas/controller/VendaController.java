package com.papelaria.vendas.controller;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @PostMapping
    public ResponseEntity<String> criarVenda(@RequestBody VendaRequest vendaRequest) {
        System.out.println("Recebida requisição de venda para o cliente ID: " + vendaRequest.getClienteId());

        try {
            // Publicamos a mensagem na fila 'vendas_pendentes'
            rabbitTemplate.convertAndSend("vendas_pendentes", vendaRequest);
            return new ResponseEntity<>("Requisição de venda enviada para processamento.", HttpStatus.ACCEPTED);
        } catch (Exception e) {
            System.err.println("Erro ao enviar mensagem para a fila: " + e.getMessage());
            return new ResponseEntity<>("Erro ao processar requisição de venda.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}