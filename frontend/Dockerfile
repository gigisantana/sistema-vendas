FROM node:20-alpine AS build

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

# Constrói a aplicação para produção
RUN npm run build

# Inicia a aplicação com Nginx
FROM nginx:stable-alpine

# Copia os arquivos de build do estágio anterior para o servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]