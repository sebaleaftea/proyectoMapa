package cl.accesimap.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que mapea la tabla normativa_multas de la Ley 20.422.
 * Contiene información sobre las categorías de infracciones, artículos asociados
 * y montos de multas en UF (Unidades de Fomento).
 */
@Entity
@Table(name = "normativa_multas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NormativaMulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Categoría de barrera arquitectónica (RAMPA, ASCENSOR, BAÑO, etc.)
     * Debe coincidir con CategoriaInfraestructura en reportes
     */
    @Column(nullable = false, length = 50)
    private String categoria;

    /**
     * Artículo de la Ley 20.422 que corresponde a la infracción
     * Ej: "Art. 47", "Art. 48", etc.
     */
    @Column(nullable = false, length = 100)
    private String articuloLey;

    /**
     * Multa mínima en UTM (Unidad Tributaria Mensual)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal multaMinUtm;

    /**
     * Multa máxima en UTM (Unidad Tributaria Mensual)
     */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal multaMaxUtm;

    /**
     * Nivel de gravedad de la infracción (LEVE, GRAVE, MUY_GRAVE)
     */
    @Column(nullable = false, length = 50)
    private String gravedad;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
