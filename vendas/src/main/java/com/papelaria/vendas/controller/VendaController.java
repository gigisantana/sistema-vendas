package com.papelaria.vendas.controller;

import com.papelaria.vendas.model.ItemVenda;
import com.papelaria.vendas.model.Venda;
import com.papelaria.vendas.repository.ItemVendaRepository;
import com.papelaria.vendas.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    @Autowired
    private VendaRepository vendaRepository;

    @Autowired
    private ItemVendaRepository itemVendaRepository;

    @PostMapping
    public ResponseEntity<Venda> criarVenda(@RequestBody VendaRequest vendaRequest) {
        // LÓGICA DE NEGÓCIO: SIMULAÇÃO
        // 1. Chamar o microsserviço de Clientes (gRPC) para validar o cliente
        System.out.println("Chamando serviço de Clientes para validar o ID: " + vendaRequest.getClienteId());

        // 2. Chamar o microsserviço de Produtos (REST) para buscar detalhes dos produtos
        System.out.println("Chamando serviço de Produtos para buscar IDs: " + vendaRequest.getProdutoIds());

        // Simulação de que a validação e busca deram certo
        Venda novaVenda = new Venda();
        novaVenda.setClienteId(vendaRequest.getClienteId());
        novaVenda.setDataVenda(new Date());

        List<ItemVenda> itens = vendaRequest.getProdutoIds().stream()
            .map(produtoId -> {
                ItemVenda item = new ItemVenda();
                item.setProdutoId(produtoId);
                item.setQuantidade(1); // Simulação de quantidade
                item.setValorUnitario(10.00); // Simulação de preço
                item.setVenda(novaVenda);
                return item;
            })
            .collect(Collectors.toList());

        novaVenda.setItens(itens);
        Venda vendaSalva = vendaRepository.save(novaVenda);
        itemVendaRepository.saveAll(itens);

        return new ResponseEntity<>(vendaSalva, HttpStatus.CREATED);
    }
}