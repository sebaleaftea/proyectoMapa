package cl.accesimap.controller;

import cl.accesimap.domain.entity.Comuna;
import cl.accesimap.repository.ComunaRepository;
import cl.accesimap.service.ComunaService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LinearRing;
import org.locationtech.jts.geom.Polygon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comunas")
@RequiredArgsConstructor
public class ComunaController {

    private final ComunaService comunaService;
    private final ComunaRepository comunaRepository;
    private final GeometryFactory geometryFactory;

    /**
     * Crear una nueva comuna
     * 
     * Acepta GeoJSON en el formato:
     * {
     *   "nombre": "Santiago Centro",
     *   "poligono": {
     *     "type": "Polygon",
     *     "coordinates": [[
     *       [-70.6667, -33.4489],
     *       [-70.6300, -33.4489],
     *       [-70.6300, -33.4100],
     *       [-70.6667, -33.4100],
     *       [-70.6667, -33.4489]
     *     ]]
     *   }
     * }
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<?> crearComuna(@RequestBody Map<String, Object> request) {
        try {
            String nombre = (String) request.get("nombre");
            Integer id = (Integer) request.get("id");
            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "VALIDATION_ERROR");
                error.put("message", "El nombre de la comuna es requerido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Convertir GeoJSON a Polygon
            Map<String, Object> geoJsonMap = (Map<String, Object>) request.get("poligono");
            
            if (geoJsonMap == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "VALIDATION_ERROR");
                error.put("message", "El polígono (GeoJSON) es requerido");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            Polygon poligono = convertGeoJsonToPolygon(geoJsonMap);

            // Crear la comuna usando el servicio
            Comuna comuna = comunaService.crearComuna(id,nombre, poligono);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", comuna.getId());
            responseData.put("nombre", comuna.getNombre());
            responseData.put("poligono", convertPolygonToGeoJson(comuna.getPoligono()));

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);
            root.put("message", "Comuna creada exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(root);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al procesar la solicitud: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Obtener una comuna por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerComunaPorId(@PathVariable Integer id) {
        try {
            Comuna comuna = comunaService.obtenerComunaPorId(id);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", comuna.getId());
            responseData.put("nombre", comuna.getNombre());
            responseData.put("poligono", convertPolygonToGeoJson(comuna.getPoligono()));

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);

            return ResponseEntity.ok(root);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Obtener comuna por nombre
     */
    @GetMapping("/nombre/{nombre}")
    public ResponseEntity<?> obtenerComunaPorNombre(@PathVariable String nombre) {
        try {
            Comuna comuna = comunaService.obtenerComunaPorNombre(nombre);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", comuna.getId());
            responseData.put("nombre", comuna.getNombre());
            responseData.put("poligono", convertPolygonToGeoJson(comuna.getPoligono()));

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);

            return ResponseEntity.ok(root);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Obtener todas las comunas
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodasComunas() {
        try {
            List<Comuna> comunas = comunaService.obtenerTodasComunas();

            List<Map<String, Object>> comunasData = comunas.stream()
                    .map(comuna -> {
                        Map<String, Object> comunaMap = new HashMap<>();
                        comunaMap.put("id", comuna.getId());
                        comunaMap.put("nombre", comuna.getNombre());
                        comunaMap.put("poligono", convertPolygonToGeoJson(comuna.getPoligono()));
                        return comunaMap;
                    })
                    .toList();

            Map<String, Object> root = new HashMap<>();
            root.put("data", comunasData);
            root.put("total", comunas.size());

            return ResponseEntity.ok(root);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al obtener las comunas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Actualizar una comuna
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> actualizarComuna(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> request) {
        try {
            String nombre = (String) request.get("nombre");
            Polygon poligono = null;

            if (request.containsKey("poligono")) {
                Map<String, Object> geoJsonMap = (Map<String, Object>) request.get("poligono");
                if (geoJsonMap != null) {
                    poligono = convertGeoJsonToPolygon(geoJsonMap);
                }
            }

            Comuna comunaActualizada = comunaService.actualizarComuna(id, nombre, poligono);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", comunaActualizada.getId());
            responseData.put("nombre", comunaActualizada.getNombre());
            responseData.put("poligono", convertPolygonToGeoJson(comunaActualizada.getPoligono()));

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);
            root.put("message", "Comuna actualizada exitosamente");

            return ResponseEntity.ok(root);

        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "VALIDATION_ERROR");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al actualizar la comuna: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Eliminar una comuna
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> eliminarComuna(@PathVariable Integer id) {
        try {
            comunaService.eliminarComuna(id);

            Map<String, Object> root = new HashMap<>();
            root.put("message", "Comuna eliminada exitosamente");

            return ResponseEntity.ok(root);

        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al eliminar la comuna: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Contar total de comunas
     */
    @GetMapping("/stats/total")
    public ResponseEntity<?> contarComunas() {
        try {
            long total = comunaService.contarComunas();

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("total", total);

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);

            return ResponseEntity.ok(root);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al contar comunas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Método auxiliar para convertir GeoJSON a Polygon JTS
     */
    private Polygon convertGeoJsonToPolygon(Map<String, Object> geoJson) {
        try {
            // Validar que sea un Polygon
            String type = (String) geoJson.get("type");
            if (!"Polygon".equals(type)) {
                throw new IllegalArgumentException("El tipo debe ser 'Polygon'");
            }

            // Obtener las coordenadas
            Object coordsObj = geoJson.get("coordinates");
            if (!(coordsObj instanceof List)) {
                throw new IllegalArgumentException("Las coordenadas deben ser una lista");
            }

            List<?> rings = (List<?>) coordsObj;
            if (rings.isEmpty()) {
                throw new IllegalArgumentException("Al menos un anillo es requerido");
            }

            // Primer anillo es el exterior (shell)
            List<?> shellCoords = (List<?>) rings.get(0);
            Coordinate[] coordinates = new Coordinate[shellCoords.size()];

            for (int i = 0; i < shellCoords.size(); i++) {
                List<?> coord = (List<?>) shellCoords.get(i);
                if (coord.size() < 2) {
                    throw new IllegalArgumentException("Cada coordenada debe tener al menos [longitude, latitude]");
                }
                double longitude = ((Number) coord.get(0)).doubleValue();
                double latitude = ((Number) coord.get(1)).doubleValue();
                coordinates[i] = new Coordinate(longitude, latitude);
            }

            // Crear LinearRing (anillo cerrado)
            LinearRing shell = geometryFactory.createLinearRing(coordinates);

            // Crear Polygon (sin agujeros por ahora)
            Polygon polygon = geometryFactory.createPolygon(shell);

            // Establecer SRID a 4326 (WGS84)
            polygon.setSRID(4326);

            return polygon;

        } catch (Exception e) {
            throw new IllegalArgumentException("Error al parsear GeoJSON: " + e.getMessage(), e);
        }
    }

    /**
     * Método auxiliar para convertir Polygon JTS a GeoJSON
     */
    private Map<String, Object> convertPolygonToGeoJson(Polygon polygon) {
        Map<String, Object> geoJson = new HashMap<>();
        geoJson.put("type", "Polygon");

        List<Object> coordinates = new java.util.ArrayList<>();

        // Shell exterior
        Coordinate[] shellCoords = polygon.getExteriorRing().getCoordinates();
        List<Object> shellCoordList = new java.util.ArrayList<>();
        for (Coordinate coord : shellCoords) {
            List<Double> coordPair = new java.util.ArrayList<>();
            coordPair.add(coord.getX()); // Longitud
            coordPair.add(coord.getY()); // Latitud
            shellCoordList.add(coordPair);
        }
        coordinates.add(shellCoordList);

        // Agujeros (si los hay)
        for (int i = 0; i < polygon.getNumInteriorRing(); i++) {
            Coordinate[] holeCoords = polygon.getInteriorRingN(i).getCoordinates();
            List<Object> holeCoordList = new java.util.ArrayList<>();
            for (Coordinate coord : holeCoords) {
                List<Double> coordPair = new java.util.ArrayList<>();
                coordPair.add(coord.getX()); // Longitud
                coordPair.add(coord.getY()); // Latitud
                holeCoordList.add(coordPair);
            }
            coordinates.add(holeCoordList);
        }

        geoJson.put("coordinates", coordinates);

        return geoJson;
    }
}
