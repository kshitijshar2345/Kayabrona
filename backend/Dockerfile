# Railway detected a Dockerfile in your build cache.
# This is the CORRECT Dockerfile that will fix:
#   "Error: Unable to access jarfile target/backend-0.0.1-SNAPSHOT.jar"
#
# Place this file at: backend/Dockerfile
# (same folder as pom.xml)
#
# WHY THE ERROR HAPPENED:
# The previous Dockerfile tried to COPY the jar BEFORE Maven built it,
# or used a wrong artifact ID. This version builds Maven FIRST, then copies.

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first — Docker caches this layer separately
# So Maven dependencies are only re-downloaded when pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Run ────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built jar from Stage 1
# Uses wildcard *.jar so it works regardless of exact version in artifact name
COPY --from=build /app/target/*.jar app.jar

# Railway injects PORT env var — Spring Boot reads it via server.port=${PORT:8080}
EXPOSE 8080

# Start with prod profile — reads application-prod.properties
ENTRYPOINT ["java", "-Dspring.profiles.active=prod", "-jar", "app.jar"]