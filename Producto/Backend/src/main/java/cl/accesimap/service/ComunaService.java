package cl.accesimap.service;

import cl.accesimap.domain.entity.Comuna;
import cl.accesimap.repository.ComunaRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ComunaService {

    @Autowired
    private ComunaRepository comunaRepository;

    /**
     * Crear una nueva comuna con su polígono de límites
     * 
     * @param nombre Nombre de la comuna
     * @param poligono Polígono que delimita el área de la comuna (PostGIS Geometry)
     * @return La comuna creada
     */
    @Transactional
    public Comuna crearComuna(Integer id,String nombre, Polygon poligono) {
        // Validar que el polígono sea válido
        if (poligono == null || poligono.isEmpty()) {
            throw new IllegalArgumentException("El polígono no puede ser nulo o vacío");
        }

        // Validar que el nombre no esté vacío
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la comuna no puede estar vacío");
        }

        // Validar que el polígono sea válido (closed ring, etc)
        if (!poligono.isValid()) {
            throw new IllegalArgumentException("El polígono no es válido. Asegúrese de que la primera y última coordenada sean iguales");
        }

        // Verificar que no exista una comuna con el mismo nombre
        Optional<Comuna> comunaExistente = comunaRepository.findByNombre(nombre);
        if (comunaExistente.isPresent()) {
            throw new IllegalArgumentException("Ya existe una comuna con el nombre: " + nombre);
        }

        Comuna comuna = new Comuna();
        comuna.setId(id);
        comuna.setNombre(nombre.trim());
        comuna.setPoligono(poligono);

        return comunaRepository.save(comuna);
    }

    /**
     * Obtener una comuna por su ID
     * 
     * @param id ID de la comuna
     * @return La comuna encontrada
     */
    public Comuna obtenerComunaPorId(Integer id) {
        return comunaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comuna no encontrada con ID: " + id));
    }

    /**
     * Obtener una comuna por su nombre
     * 
     * @param nombre Nombre de la comuna
     * @return La comuna encontrada
     */
    public Comuna obtenerComunaPorNombre(String nombre) {
        return comunaRepository.findByNombre(nombre)
                .orElseThrow(() -> new RuntimeException("Comuna no encontrada con nombre: " + nombre));
    }

    /**
     * Obtener todas las comunas
     * 
     * @return Lista de todas las comunas
     */
    public List<Comuna> obtenerTodasComunas() {
        return comunaRepository.findAll();
    }

    /**
     * Actualizar una comuna existente
     * 
     * @param id ID de la comuna a actualizar
     * @param nombre Nuevo nombre (opcional, null para no cambiar)
     * @param poligono Nuevo polígono (opcional, null para no cambiar)
     * @return La comuna actualizada
     */
    @Transactional
    public Comuna actualizarComuna(Integer id, String nombre, Polygon poligono) {
        Comuna comuna = obtenerComunaPorId(id);

        if (nombre != null && !nombre.trim().isEmpty()) {
            // Verificar que no exista otra comuna con el nuevo nombre
            Optional<Comuna> otraComunaConNombre = comunaRepository.findByNombre(nombre);
            if (otraComunaConNombre.isPresent() && !otraComunaConNombre.get().getId().equals(id)) {
                throw new IllegalArgumentException("Ya existe otra comuna con el nombre: " + nombre);
            }
            comuna.setNombre(nombre.trim());
        }

        if (poligono != null) {
            if (!poligono.isValid()) {
                throw new IllegalArgumentException("El polígono no es válido");
            }
            if (poligono.isEmpty()) {
                throw new IllegalArgumentException("El polígono no puede estar vacío");
            }
            comuna.setPoligono(poligono);
        }

        return comunaRepository.save(comuna);
    }

    /**
     * Eliminar una comuna
     * 
     * @param id ID de la comuna a eliminar
     */
    @Transactional
    public void eliminarComuna(Integer id) {
        Comuna comuna = obtenerComunaPorId(id);
        comunaRepository.delete(comuna);
    }

    /**
     * Contar total de comunas
     * 
     * @return Número total de comunas
     */
    public long contarComunas() {
        return comunaRepository.count();
    }
}
