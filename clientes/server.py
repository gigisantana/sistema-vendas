import grpc
import time
from concurrent import futures
import mysql.connector
import os
from grpc_reflection.v1alpha import reflection

import clients_pb2 as pb2
import clients_pb2_grpc as pb2_grpc

# --- Conexão com o Banco de Dados MySQL ---
# Usa as variáveis de ambiente injetadas pelo Docker
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': 'papelaria_db'
}

def get_db_connection():
    while True:
        try:
            conn = mysql.connector.connect(**db_config)
            print("Conectado ao banco de dados de clientes!")
            return conn
        except mysql.connector.Error as err:
            print(f"Erro ao conectar ao banco de dados: {err}")
            time.sleep(5)

# --- Implementação do Serviço gRPC ---
class ClientServiceServicer(pb2_grpc.ClientServiceServicer):

    def CreateClient(self, request, context):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            # Cria a tabela de clientes se ela não existir
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS clientes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    sobrenome VARCHAR(255) NOT NULL,
                    telefone VARCHAR(20) NOT NULL
                );
            """)

            sql = "INSERT INTO clientes (nome, sobrenome, telefone) VALUES (%s, %s, %s)"
            val = (request.nome, request.sobrenome, request.telefone)
            cursor.execute(sql, val)
            conn.commit()
            
            new_client_id = cursor.lastrowid
            print(f"clientes cadastrado: {request.nome} {request.sobrenome}")
            return pb2.Client(id=new_client_id, nome=request.nome, sobrenome=request.sobrenome, telefone=request.telefone)

        finally:
            cursor.close()
            conn.close()

    def ListClients(self, request, context):
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT id, nome, sobrenome, telefone FROM clientes")
            clients_data = cursor.fetchall()
            
            clients_list = [
                pb2.Client(id=row[0], nome=row[1], sobrenome=row[2], telefone=row[3])
                for row in clients_data
            ]
            print("Listando todos os clientes.")
            return pb2.ClientList(clients=clients_list)
        
        finally:
            cursor.close()
            conn.close()

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_ClientServiceServicer_to_server(ClientServiceServicer(), server)
    SERVICE_NAMES = (
        pb2.DESCRIPTOR.services_by_name['ClientService'].full_name,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(SERVICE_NAMES, server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Microsserviço de Clientes rodando na porta 50051.")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()