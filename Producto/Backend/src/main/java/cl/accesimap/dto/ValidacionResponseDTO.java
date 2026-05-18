package cl.accesimap.dto;

import java.time.LocalDateTime;

/**
 * DTO para retornar validaciones ciudadanas al frontend.
 * Usado en respuesta GET /api/v1/reportes/{reporteId}/validaciones
 *
 * @param nombreUsuario Nombre visible del usuario que validó
 * @param esPositiva    Voto ciudadano: true = Like, false = Dislike
 * @param comentario    Comentario opcional del validador
 * @param fechaCreacion Timestamp de creación de la validación
 */
public record ValidacionResponseDTO(
    String nombreUsuario,
    Boolean esPositiva,
    String comentario,
    LocalDateTime fechaCreacion
) {}
