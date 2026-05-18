package cl.accesimap.repository;

import cl.accesimap.domain.entity.NormativaMulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository para acceder a datos de normativas y multas según la Ley 20.422.
 */
@Repository
public interface NormativaMultaRepository extends JpaRepository<NormativaMulta, Long> {
    
    /**
     * Busca una normativa de multa por categoría de infraestructura.
     * @param categoria Nombre de la categoría (RAMPA, ASCENSOR, BAÑO, etc.)
     * @return NormativaMulta si existe
     */
    Optional<NormativaMulta> findByCategoria(String categoria);
}
