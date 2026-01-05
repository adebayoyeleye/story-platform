package com.storyplatform.contentservice.exception;

import com.storyplatform.contentservice.dto.ApiErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponseDto> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest req
    ) {
        // 404 is normal behavior; don't spam error logs
        log.info("Not found on {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponseDto> handleBadRequest(
            IllegalArgumentException ex,
            HttpServletRequest req
    ) {
        // Business rule failures / invalid transitions should be 400 with message
        log.info("Bad request on {} {}: {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponseDto> handleValidationBody(
            MethodArgumentNotValidException ex,
            HttpServletRequest req
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }

        log.warn("Validation failed on {}: {}", req.getRequestURI(), fieldErrors);

        return build(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                req.getRequestURI(),
                fieldErrors
        );
    }

    /**
     * Handles validation on @RequestParam / @PathVariable when using jakarta validation
     * (e.g. @Min, @NotBlank on params) — these don't go through MethodArgumentNotValidException.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponseDto> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest req
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        for (ConstraintViolation<?> v : ex.getConstraintViolations()) {
            // propertyPath typically looks like: methodName.arg0 or methodName.paramName
            // We'll take the last segment as the "field"
            String path = v.getPropertyPath() == null ? "param" : v.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;

            fieldErrors.putIfAbsent(field, v.getMessage());
        }

        log.warn("Constraint violation on {}: {}", req.getRequestURI(), fieldErrors);

        return build(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                req.getRequestURI(),
                fieldErrors
        );
    }

    /**
     * Handles invalid enum values or bad query/path values, e.g. ?status=NOPE
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponseDto> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex,
            HttpServletRequest req
    ) {
        String name = ex.getName(); // param name
        String value = ex.getValue() == null ? "null" : ex.getValue().toString();
        String required = ex.getRequiredType() == null ? "unknown" : ex.getRequiredType().getSimpleName();

        Map<String, String> fieldErrors = Map.of(
                name, "Invalid value '" + value + "' (expected " + required + ")"
        );

        log.warn("Type mismatch on {} {}: {}", req.getMethod(), req.getRequestURI(), fieldErrors);

        return build(
                HttpStatus.BAD_REQUEST,
                "Validation failed",
                req.getRequestURI(),
                fieldErrors
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponseDto> handleBadJson(
            HttpMessageNotReadableException ex,
            HttpServletRequest req
    ) {
        // invalid JSON, malformed body, etc.
        log.warn("Malformed request body on {}: {}", req.getRequestURI(), ex.getMessage());

        return build(
                HttpStatus.BAD_REQUEST,
                "Malformed JSON request body",
                req.getRequestURI(),
                null
        );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponseDto> handleNoResource(
            NoResourceFoundException ex,
            HttpServletRequest req
    ) {
        // wrong URLs, missing swagger assets, etc.
        log.info("No resource for {} {}", req.getMethod(), req.getRequestURI());
        return build(HttpStatus.NOT_FOUND, "Not found", req.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponseDto> handleGeneric(
            Exception ex,
            HttpServletRequest req
    ) {
        log.error("Unhandled exception on {} {}", req.getMethod(), req.getRequestURI(), ex);

        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Unexpected error occurred",
                req.getRequestURI(),
                null
        );
    }

    private ResponseEntity<ApiErrorResponseDto> build(
            HttpStatus status,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        ApiErrorResponseDto body = new ApiErrorResponseDto(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                path,
                fieldErrors == null ? Map.of() : fieldErrors
        );
        return ResponseEntity.status(status).body(body);
    }
}
