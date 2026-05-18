package cl.accesimap.repository;

import cl.accesimap.domain.entity.ValidacionReporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository para acceder a datos de validaciones ciudadanas de reportes.
 */
@Repository
public interface ValidacionReporteRepository extends JpaRepository<ValidacionReporte, Long> {
    
    /**
     * Busca todas las validaciones de un reporte ordenadas por fecha descendente.
     */
    List<ValidacionReporte> findByReporteIdOrderByFechaCreacionDesc(UUID reporteId);

    /**
     * Verifica si un usuario ya validó un reporte específico.
     * Usado para impedir votos duplicados.
     */
    boolean existsByReporteIdAndUsuarioEmail(UUID reporteId, String usuarioEmail);

    /**
     * Cuenta las validaciones positivas de un reporte.
     */
    long countByReporteIdAndEsPositivaTrue(UUID reporteId);

    /**
     * Cuenta el total de validaciones de un reporte.
     */
    long countByReporteId(UUID reporteId);
}
