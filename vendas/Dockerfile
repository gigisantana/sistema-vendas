# Usa uma imagem base do OpenJDK (Java Development Kit)
FROM openjdk:21-jdk-slim

# Define o diretório de trabalho
WORKDIR /app

# Copia o pacote Maven e o código da aplicação
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Constrói a aplicação em um arquivo .jar
RUN ./mvnw package -DskipTests

# Comando que será executado quando o contêiner iniciar
CMD ["java", "-jar", "target/vendas-0.0.1-SNAPSHOT.jar"]