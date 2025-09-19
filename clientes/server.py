import grpc
import time
from concurrent import futures
import mysql.connector
import os
from fastapi import FastAPI
from grpc_reflection.v1alpha import reflection

import clients_pb2 as pb2
import clients_pb2_grpc as pb2_grpc

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME'),
}

def get_db_connection():
    while True:
        try:
            conn = mysql.connector.connect(**db_config)
            print("Conexão com o banco de dados MySQL estabelecida.")
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clientes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    sobrenome VARCHAR(255) NOT NULL,
                    telefone VARCHAR(20) NOT NULL
                );
            """)
            conn.commit()
            cursor.close()
            return conn
        except mysql.connector.Error as err:
            print(f"Erro ao conectar ao banco de dados: {err}")
            time.sleep(5)

# --- Implementação do Serviço gRPC ---
class ClientServiceServicer(pb2_grpc.ClientServiceServicer):

    def CreateClient(self, request, context):
        # A lógica para criar clientes está aqui
        pass

    def ListClients(self, request, context):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("SELECT id, nome, sobrenome, telefone FROM clientes")
            clients_data = cursor.fetchall()
            
            clients_list = [
                pb2.Client(
                    id=row['id'], 
                    nome=row['nome'], 
                    sobrenome=row['sobrenome'], 
                    telefone=row['telefone']
                )
                for row in clients_data
            ]
            print("Listando todos os clientes via gRPC.")
            return pb2.ClientList(clients=clients_list)
        
        finally:
            cursor.close()
            conn.close()

# --- API REST com FastAPI ---
app = FastAPI()

from pydantic import BaseModel
class ClienteRequest(BaseModel):
    nome: str
    sobrenome: str
    telefone: str

@app.post("/clientes")
def create_client_rest(cliente: ClienteRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        sql = "INSERT INTO clientes (nome, sobrenome, telefone) VALUES (%s, %s, %s)"
        val = (cliente.nome, cliente.sobrenome, cliente.telefone)
        cursor.execute(sql, val)
        conn.commit()
        
        new_client_id = cursor.lastrowid
        print(f"Cliente cadastrado via REST: {cliente.nome} {cliente.sobrenome}")
        return {"id": new_client_id, **cliente.dict()}
    
    finally:
        cursor.close()
        conn.close()

@app.get("/clientes")
def list_clients_rest(nome: str = None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        if nome:
            cursor.execute("SELECT id, nome, sobrenome, telefone FROM clientes WHERE nome LIKE %s", ('%' + nome + '%',))
        else:
            cursor.execute("SELECT id, nome, sobrenome, telefone FROM clientes")
        
        clients_data = cursor.fetchall()
        print("Listando todos os clientes via REST.")
        return clients_data
    
    finally:
        cursor.close()
        conn.close()

# --- Função que inicia o servidor gRPC e REST ---
def serve():
    # Código para iniciar o servidor gRPC
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_ClientServiceServicer_to_server(ClientServiceServicer(), server)
    SERVICE_NAMES = (
        pb2.DESCRIPTOR.services_by_name['ClientService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Microsserviço de Clientes (gRPC) rodando na porta 50051.")

    # Código para iniciar o servidor REST do FastAPI
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=50052)
    print("Microsserviço de Clientes (REST) rodando na porta 50052.")

if __name__ == '__main__':
    serve()