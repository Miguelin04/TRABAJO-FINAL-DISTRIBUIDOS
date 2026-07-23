# Build Stage
FROM maven:3.8.7-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/pagos-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 9000-9005
ENTRYPOINT ["java", "-jar", "app.jar"]
