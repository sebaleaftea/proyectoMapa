package cl.accesimap.controller;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.enums.CategoriaInfraestructura;
import cl.accesimap.domain.enums.EstadoReporte;
import cl.accesimap.dto.ReporteDetalleDTO;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.security.JwtUtil;
import cl.accesimap.service.ReporteService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;
    private final ReporteRepository reporteRepository;
    private final JwtUtil jwtUtil;

    @PostMapping
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<?> crearReporte(
            @RequestParam("foto") MultipartFile foto,
            @RequestParam("latitud") Double latitud,
            @RequestParam("longitud") Double longitud,
            @RequestParam("categoria") String categoriaStr,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            HttpServletRequest request) {

        try {
            String token = request.getHeader("Authorization").substring(7);
            UUID usuarioId = UUID.fromString(jwtUtil.extractUserId(token));
            CategoriaInfraestructura categoria = CategoriaInfraestructura.valueOf(categoriaStr.toUpperCase());

            Reporte reporte = reporteService.procesarNuevoReporte(
                    foto, latitud, longitud, categoria, descripcion, usuarioId
            );

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("id", reporte.getId());
            responseData.put("estado", reporte.getEstado());
            responseData.put("nivelConfianzaIa", reporte.getNivelConfianzaIa());
            
            // Lógica simple para response
            if (reporte.getEstado() == EstadoReporte.VALIDADO) {
                responseData.put("puntosOtorgados", 10);
            }

            Map<String, Object> root = new HashMap<>();
            root.put("data", responseData);
            root.put("message", "Reporte creado y procesado exitosamente.");

            return ResponseEntity.status(HttpStatus.CREATED).body(root);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "PROCESSING_ERROR");
            error.put("message", "Error al procesar el reporte: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerReportePorId(@PathVariable UUID id) {
        try {
            ReporteDetalleDTO detalle = reporteService.obtenerReportePorId(id);
            Map<String, Object> response = new HashMap<>();
            response.put("data", detalle);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "NOT_FOUND");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<?> obtenerReportes(
            @RequestParam(required = false) Integer comunaId,
            @RequestParam(required = false) String estado) {
        
        List<Reporte> reportes;
        if (comunaId != null && estado != null) {
            reportes = reporteRepository.findByComunaIdAndEstado(comunaId, estado.toUpperCase());
        } else if (comunaId != null) {
            reportes = reporteRepository.findByComunaId(comunaId);
        } else if (estado != null) {
            reportes = reporteRepository.findByEstado(EstadoReporte.valueOf(estado.toUpperCase()));
        } else {
            reportes = reporteRepository.findAll(); // Cuidado en prod sin limite
        }

        Map<String, Object> response = new HashMap<>();
        response.put("data", reportes);
        response.put("count", reportes.size());
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('MUNICIPALIDAD', 'ADMINISTRADOR')")
    public ResponseEntity<?> modificarEstado(
            @PathVariable UUID id,
            @Valid @RequestBody CambioEstadoDTO dto) {
        
        Reporte reporteActualizado = reporteService.cambiarEstado(
                id, EstadoReporte.valueOf(dto.getNuevoEstado().toUpperCase())
        );

        Map<String, Object> response = new HashMap<>();
        response.put("data", reporteActualizado);
        response.put("message", "Estado actualizado manualmente.");

        return ResponseEntity.ok(response);
    }

    @Data
    public static class CambioEstadoDTO {
        @NotNull(message = "El estado no puede ser nulo")
        @Pattern(regexp = "^(VALIDADO|RECHAZADO|PENDIENTE)$")
        private String nuevoEstado;
        
        private String comentarioRevision;
    }
}