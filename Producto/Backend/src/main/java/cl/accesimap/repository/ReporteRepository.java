package cl.accesimap.repository;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.enums.EstadoReporte;
import cl.accesimap.dto.DashboardMetricsDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, UUID> {

    List<Reporte> findByEstado(EstadoReporte estado);

    // Consulta espacial: Todos los reportes dentro del polígono de una comuna específica
    @Query(value = "SELECT r.* FROM reportes r, comunas c WHERE c.id = :comunaId AND ST_Contains(c.poligono, r.ubicacion) AND r.estado = :estado", nativeQuery = true)
    List<Reporte> findByComunaIdAndEstado(@Param("comunaId") Integer comunaId, @Param("estado") String estado);

    @Query(value = "SELECT r.* FROM reportes r, comunas c WHERE c.id = :comunaId AND ST_Contains(c.poligono, r.ubicacion)", nativeQuery = true)
    List<Reporte> findByComunaId(@Param("comunaId") Integer comunaId);

    /**
     * Calcula métricas de riesgo municipal: total de barreras validadas y exposición máxima a multas.
     * 
     * Lógica:
     * 1. Filtra reportes por estado VALIDADO y estado_elemento MAL_ESTADO
     * 2. Usa ST_Within de PostGIS para cruzar puntos (reportes) con polígono (comuna)
     * 3. Realiza JOIN con normativa_multas por categoría
     * 4. Retorna cantidad de barreras y suma de multas máximas en UTM
     */
    @Query(value = "SELECT " +
            "new cl.accesimap.dto.DashboardMetricsDTO(" +
            "CAST(COUNT(r.id) AS java.lang.Integer), " +
            "COALESCE(SUM(nm.multaMaxUtm), 0)" +
            ") " +
            "FROM Reporte r " +
            "JOIN NormativaMulta nm ON CAST(r.categoria AS java.lang.String) = nm.categoria " +
            "WHERE r.estado = 'VALIDADO' " +
            "AND r.estadoElemento = 'MAL_ESTADO' " +
            "AND r.comuna.id = :comunaId")
    DashboardMetricsDTO calcularRiesgoComunal(@Param("comunaId") Integer comunaId);

    @Query(value = "SELECT " +
            "new cl.accesimap.dto.DashboardMetricsDTO(" +
            "CAST(COUNT(r.id) AS java.lang.Integer), " +
            "COALESCE(SUM(nm.multaMaxUtm), 0)" +
            ") " +
            "FROM Reporte r " +
            "JOIN NormativaMulta nm ON CAST(r.categoria AS java.lang.String) = nm.categoria " +
            "WHERE r.estado = 'VALIDADO' " +
            "AND r.estadoElemento = 'MAL_ESTADO' " +
            "AND r.comuna.id = :comunaId " +
            "AND r.fechaCreacion >= :fechaInicio " +
            "AND r.fechaCreacion < :fechaFin")
    DashboardMetricsDTO calcularRiesgoPorPeriodo(
        @Param("comunaId") Integer comunaId, 
        @Param("fechaInicio") java.time.LocalDateTime fechaInicio,
        @Param("fechaFin") java.time.LocalDateTime fechaFin
    );
    @Query(value = "SELECT r.* FROM reportes r WHERE r.usuario_id = :usuarioId ORDER BY r.fecha_creacion DESC", nativeQuery = true)
    List<Reporte> findByUsuarioId(@Param("usuarioId") java.util.UUID usuarioId);
}
