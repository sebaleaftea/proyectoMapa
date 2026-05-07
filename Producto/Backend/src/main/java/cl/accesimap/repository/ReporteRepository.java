package cl.accesimap.repository;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.enums.EstadoReporte;
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
}
