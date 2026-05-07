package cl.accesimap.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> errorDetails = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errorDetails.put(error.getField(), error.getDefaultMessage()));

        Map<String, Object> root = new HashMap<>();
        root.put("error", "VALIDATION_ERROR");
        root.put("message", "Los datos no cumplen con las reglas de validación.");
        root.put("details", errorDetails);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(root);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeExceptions(RuntimeException ex) {
        Map<String, Object> root = new HashMap<>();
        root.put("error", "INTERNAL_ERROR");
        root.put("message", ex.getMessage());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(root);
    }
}
