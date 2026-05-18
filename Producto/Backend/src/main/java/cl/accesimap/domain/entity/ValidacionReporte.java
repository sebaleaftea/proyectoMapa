package cl.accesimap.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad que mapea validaciones ciudadanas de reportes.
 * Cada validación representa el voto (positivo/negativo) de un usuario
 * sobre la existencia y severidad de una barrera arquitectónica.
 */
@Entity
@Table(name = "validaciones_reportes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidacionReporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Relación ManyToOne con Reporte.
     * Un reporte puede tener múltiples validaciones.
     * Un índice de BD acelerará búsquedas por reporteId.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporte_id", nullable = false)
    private Reporte reporte;

    /**
     * Email del usuario que valida (extraído desde JWT/SecurityContext).
     * Se almacena como String para mayor flexibilidad.
     * En futuro podría convertirse en relación con tabla Usuario.
     */
    @Column(nullable = false, length = 255)
    private String usuarioEmail;

    /**
     * Voto ciudadano: true = positivo (Like), false = negativo (Dislike).
     * Positivo: "Confirmo que la barrera existe y necesita reparación"
     * Negativo: "No confirmo que la barrera exista / ya fue reparada"
     */
    @Column(nullable = false)
    private Boolean esPositiva;

    /**
     * Comentario opcional del validador (máximo 500 caracteres).
     * Ej: "La rampa está completamente rota", "Ya fue reparada en mayo"
     */
    @Column(length = 500)
    private String comentario;

    /**
     * Timestamp de creación automático.
     * Usado para ordenar validaciones más recientes primero.
     */
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
