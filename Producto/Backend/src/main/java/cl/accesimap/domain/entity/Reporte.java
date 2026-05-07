package cl.accesimap.domain.entity;

import cl.accesimap.domain.enums.CategoriaInfraestructura;
import cl.accesimap.domain.enums.EstadoReporte;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.locationtech.jts.geom.Point;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "reportes")
@Setter
@Getter
public class Reporte {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategoriaInfraestructura categoria;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "foto_url", nullable = false, length = 500)
    private String fotoUrl;

    @Column(nullable = false, columnDefinition = "geometry(Point, 4326)")
    private Point ubicacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private EstadoReporte estado = EstadoReporte.PENDIENTE;

    @Column(name = "estado_elemento")
    private String estadoElemento; // Guardará "BUEN_ESTADO", "MAL_ESTADO", etc.

    @Column(columnDefinition = "TEXT", name = "justificacion_ia")
    private String justificacionIa;

    @Column(name = "nivel_confianza_ia")
    private Float nivelConfianzaIa;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
