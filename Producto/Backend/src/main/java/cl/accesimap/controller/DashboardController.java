package cl.accesimap.controller;

import cl.accesimap.dto.DashboardMetricsDTO;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.service.RiesgoAlertaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador REST para el Dashboard de Riesgo Municipal.
 * Expone métricas de exposición financiera a multas según la Ley 20.422.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final ReporteRepository reporteRepository;
    private final RiesgoAlertaService alertaService;

    /**
     * Obtiene métricas de riesgo municipal para una comuna específica.
     *
     * @param comunaId ID de la comuna
     * @return ResponseEntity con DashboardMetricsDTO que incluye:
     *         - totalBarreras: cantidad de barreras arquitectónicas validadas en MAL_ESTADO
     *         - exposicionMaximaUtm: suma de multas máximas en UTM
     *
     * Ejemplo de respuesta:
     * {
     *   "totalBarreras": 45,
     *   "exposicionMaximaUtm": 5670.50
     * }
     */
    @GetMapping("/riesgo-municipal/{comunaId}")
    public ResponseEntity<?> obtenerRiesgoMunicipal(@PathVariable Integer comunaId) {
        try {
            log.info("Solicitando métricas de riesgo para comuna: {}", comunaId);

            // Calcula métricas usando la query nativa de PostGIS + normativas
            DashboardMetricsDTO metrics = reporteRepository.calcularRiesgoComunal(comunaId);

            if (metrics == null) {
                log.warn("No se encontraron métricas para la comuna: {}", comunaId);
                return ResponseEntity.ok(new DashboardMetricsDTO(0, null));
            }

            log.info("Métricas calculadas - Barreras: {}, Exposición: {} UTM",
                    metrics.totalBarreras(), metrics.exposicionMaximaUtm());

            return ResponseEntity.ok(metrics);

        } catch (Exception e) {
            log.error("Error al calcular riesgo municipal para comuna {}: {}", comunaId, e.getMessage(), e);

            // Retorna error en formato amigable
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", "Error al obtener métricas de riesgo");
            error.put("detalle", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/heatmap/{comunaId}")
    public ResponseEntity<?> obtenerDatosHeatmap(@PathVariable Integer comunaId) {
        java.util.List<Map<String, Object>> heatmapPoints = reporteRepository
            .findByComunaId(comunaId)
            .stream()
            .filter(r -> "VALIDADO".equals(r.getEstado().toString()) && 
                         "MAL_ESTADO".equals(r.getEstadoElemento()))
            .map(r -> {
                Map<String, Object> point = new HashMap<>();
                point.put("lat", r.getUbicacion().getY());
                point.put("lng", r.getUbicacion().getX());
                point.put("intensity", r.getNivelConfianzaIa() != null ? 
                          r.getNivelConfianzaIa() : 0.5);
                return point;
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(heatmapPoints);
    }

    @GetMapping("/estadisticas/por-categoria/{comunaId}")
    public ResponseEntity<?> estadisticasPorCategoria(@PathVariable Integer comunaId) {
        java.util.List<Map<String, Object>> stats = reporteRepository
            .findByComunaId(comunaId)
            .stream()
            .filter(r -> "VALIDADO".equals(r.getEstado().toString()))
            .collect(java.util.stream.Collectors.groupingBy(
                r -> r.getCategoria().toString(),
                java.util.stream.Collectors.counting()
            ))
            .entrySet()
            .stream()
            .map(e -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("categoria", e.getKey());
                entry.put("cantidad", e.getValue());
                return entry;
            })
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/riesgo-temporal/{comunaId}")
    public ResponseEntity<?> riesgoTemporal(@PathVariable Integer comunaId) {
        LocalDate hoy = LocalDate.now();
        LocalDate mesAnterior = hoy.minusMonths(1);
        
        DashboardMetricsDTO thisMonth = 
            reporteRepository.calcularRiesgoPorPeriodo(
                comunaId, 
                hoy.withDayOfMonth(1).atStartOfDay(), 
                hoy.plusMonths(1).withDayOfMonth(1).atStartOfDay()
            );
            
        DashboardMetricsDTO lastMonth = 
            reporteRepository.calcularRiesgoPorPeriodo(
                comunaId, 
                mesAnterior.withDayOfMonth(1).atStartOfDay(), 
                hoy.withDayOfMonth(1).atStartOfDay()
            );
        
        // Disparar validación de alertas
        if (thisMonth != null) {
            alertaService.validarYGenerarAlertas(comunaId, thisMonth);
        }

        BigDecimal thisExposicion = thisMonth != null && thisMonth.exposicionMaximaUtm() != null ? thisMonth.exposicionMaximaUtm() : BigDecimal.ZERO;
        BigDecimal lastExposicion = lastMonth != null && lastMonth.exposicionMaximaUtm() != null ? lastMonth.exposicionMaximaUtm() : BigDecimal.ZERO;

        double changePercent = 0.0;
        if (lastExposicion.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = thisExposicion.subtract(lastExposicion)
                .divide(lastExposicion, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .doubleValue();
        } else if (thisExposicion.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = 100.0;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("current", thisMonth != null ? thisMonth : new DashboardMetricsDTO(0, BigDecimal.ZERO));
        response.put("previous", lastMonth != null ? lastMonth : new DashboardMetricsDTO(0, BigDecimal.ZERO));
        response.put("changePercent", changePercent);
        
        return ResponseEntity.ok(response);
    }
}
