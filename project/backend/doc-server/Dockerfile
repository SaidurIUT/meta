# File: /project/backend/doc-server/Dockerfile

# Use Java 21 JDK for the build stage
FROM eclipse-temurin:21-jdk-alpine as build
WORKDIR /workspace/app

# Copy gradle files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Grant execute permissions to the Gradle wrapper
RUN chmod +x gradlew

# Build the project, skipping tests
RUN ./gradlew build -x test

# Use Java 21 JRE for the runtime stage
FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp

# Copy the built jar file from the build stage
COPY --from=build /workspace/app/build/libs/*.jar app.jar

# Set the entrypoint for the container
ENTRYPOINT ["java","-jar","/app.jar"]
