import { GenerateRequest } from "../types";
import { getBasePackage, getMainClassName, hasJwt, hasSecurity, hasJpa, hasAudit, hasExHandler, hasSwagger } from "./utils";

// ── Main Application Class ────────────────────────────────────────────────────
export function generateMainClass(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  const cls = getMainClassName(req);
  return `package ${pkg};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
${hasJpa(req) ? "import org.springframework.data.jpa.repository.config.EnableJpaAuditing;\n" : ""}
@SpringBootApplication${hasJpa(req) && hasAudit(req) ? "\n@EnableJpaAuditing" : ""}
public class ${cls} {

    public static void main(String[] args) {
        SpringApplication.run(${cls}.class, args);
    }
}
`;
}

// ── Global Exception Handler ──────────────────────────────────────────────────
export function generateGlobalExceptionHandler(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  return `package ${pkg}.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<Map<String, String>> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(err -> Map.of("field", err.getField(), "message", err.getDefaultMessage()))
                .collect(Collectors.toList());

        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation failed",
                request.getRequestURI(), fieldErrors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception: ", ex);
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred", request.getRequestURI(), null);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String message, String path, Object fieldErrors) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", path);
        if (fieldErrors != null) body.put("fieldErrors", fieldErrors);
        return ResponseEntity.status(status).body(body);
    }
}
`;
}

// ── ResourceNotFoundException ─────────────────────────────────────────────────
export function generateResourceNotFoundException(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  return `package ${pkg}.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
`;
}

// ── BaseEntity (JPA Audit) ─────────────────────────────────────────────────────
export function generateBaseEntity(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  return `package ${pkg}.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
}
`;
}

// ── AuditorAwareImpl ──────────────────────────────────────────────────────────
export function generateAuditorAware(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  return `package ${pkg}.audit;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return Optional.of("SYSTEM");
        }
        return Optional.of(authentication.getName());
    }
}
`;
}

// ── OpenAPI Config ────────────────────────────────────────────────────────────
export function generateOpenApiConfig(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  const securityScheme = hasSecurity(req) ? `
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                    .addSecuritySchemes("bearerAuth", new SecurityScheme()
                            .name("bearerAuth")
                            .type(SecurityScheme.Type.HTTP)
                            .scheme("bearer")
                            .bearerFormat("JWT")))` : "";

  const securityImports = hasSecurity(req) ? `
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;` : "";

  return `package ${pkg}.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;${securityImports}
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("${req.projectName} API")
                        .version("1.0.0")
                        .description("API documentation for ${req.projectName}")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("dev@example.com"))
                        .license(new License()
                                .name("MIT License")))${securityScheme};
    }
}
`;
}

// ── Sample Controller ─────────────────────────────────────────────────────────
export function generateSampleController(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  const swaggerAnnotations = hasSwagger(req) ? `
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;` : "";
  const tagAnnotation = hasSwagger(req) ? `\n@Tag(name = "Health", description = "Health check endpoints")` : "";
  const opAnnotation = hasSwagger(req) ? `\n    @Operation(summary = "Health check", description = "Returns application health status")` : "";

  return `package ${pkg}.controller;
${swaggerAnnotations}
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.time.LocalDateTime;
${tagAnnotation}
@RestController
@RequestMapping("/api")
public class HealthController {
${opAnnotation}
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "${req.projectName}",
                "timestamp", LocalDateTime.now().toString()
        ));
    }
}
`;
}

// ── CORS Config ───────────────────────────────────────────────────────────────
export function generateCorsConfig(req: GenerateRequest): string {
  const pkg = getBasePackage(req);
  return `package ${pkg}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
`;
}
