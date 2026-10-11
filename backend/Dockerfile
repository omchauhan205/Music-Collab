# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

# Build application
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=build /app/target/*.jar app.jar

# Local file storage directory (mount a volume here in production)
RUN mkdir -p /var/data/uploads

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
