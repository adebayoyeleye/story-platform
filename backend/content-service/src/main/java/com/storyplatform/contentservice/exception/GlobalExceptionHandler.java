package com.storyplatform.contentservice.exception;

import com.storyplatform.contentservice.dto.ApiErrorResponseDto;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.http.converter.HttpMessageNotReadableException;

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
        log.error("Handled ResourceNotFoundException", ex);
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponseDto> handleBadRequest(
            IllegalArgumentException ex,
            HttpServletRequest req
    ) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponseDto> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest req
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            // if multiple errors per field, keep the first
            fieldErrors.putIfAbsent(fe.getField(), fe.getDefaultMessage());
        }

        // No stacktrace spam for validation errors
        log.warn("Validation failed on {}: {}", req.getRequestURI(), fieldErrors);

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
        // e.g. invalid enum value, malformed JSON, etc.
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
        // don’t log as ERROR; users will inevitably hit wrong URLs
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
