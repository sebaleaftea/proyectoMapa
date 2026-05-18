package cl.accesimap.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO para recibir validaciones ciudadanas desde el frontend.
 * Enviado por POST /api/v1/reportes/{reporteId}/validaciones
 */
public record ValidacionRequestDTO(
    /**
     * Voto ciudadano: true = positivo (Like), false = negativo (Dislike)
     */
    @NotNull(message = "El voto (esPositiva) es obligatorio")
    Boolean esPositiva,

    /**
     * Comentario opcional (máximo 500 caracteres).
     * Puede ser null si el usuario no escribe nada.
     */
    @Size(max = 500, message = "El comentario no puede exceder 500 caracteres")
    String comentario
) {}
