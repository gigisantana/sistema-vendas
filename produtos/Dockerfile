# Usa uma imagem base do Node.js
FROM node:18-alpine

# Define o diretório de trabalho no contêiner
WORKDIR /app

# Copia os arquivos de dependência e os instala
COPY package*.json ./
RUN npm install

# Copia o código da sua aplicação
COPY . .

# Expõe a porta que a aplicação vai rodar
EXPOSE 3001

# Comando para iniciar o servidor
CMD [ "node", "server.js" ]