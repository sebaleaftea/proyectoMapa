package cl.accesimap.dto;

import cl.accesimap.domain.enums.CategoriaInfraestructura;
import cl.accesimap.domain.enums.EstadoReporte;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReporteDetalleDTO {
    private UUID id;
    private UUID usuarioId;
    private CategoriaInfraestructura categoria;
    private String descripcion;
    private String fotoUrl;
    private Double latitud;
    private Double longitud;
    private EstadoReporte estado;
    private String estadoElemento;
    private String justificacionIa;
    private Float nivelConfianzaIa;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;

    // === NUEVOS CAMPOS: VALIDACIÓN CIUDADANA ===
    /**
     * Porcentaje de aprobación ciudadana: (Validaciones Positivas / Total) * 100
     * Null si no hay validaciones ciudadanas aún
     */
    private Double porcentajeCiudadano;

    /**
     * Total de validaciones ciudadanas realizadas para este reporte
     */
    private Integer totalValidacionesCiudadanas;
}
