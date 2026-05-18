package cl.accesimap.controller;

import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.domain.entity.ValidacionReporte;
import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.dto.ValidacionRequestDTO;
import cl.accesimap.dto.ValidacionResponseDTO;
import cl.accesimap.repository.ValidacionReporteRepository;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.service.ValidacionCiudadanaService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controlador REST para gestionar validaciones ciudadanas de reportes.
 */
@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
@Slf4j
public class ValidacionController {

    private final ValidacionReporteRepository validacionRepository;
    private final ReporteRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ValidacionCiudadanaService validacionCiudadanaService;

    // ── Helper: resuelve el nombreUsuario a partir del email en SecurityContext ──
    private String resolverNombreUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getNombreUsuario)
                .orElse(email.split("@")[0]); // fallback: parte local del email
    }

    /**
     * GET /api/v1/reportes/{reporteId}/validaciones
     * Devuelve todas las validaciones de un reporte, con nombreUsuario en lugar de email.
     */
    @GetMapping("/{reporteId}/validaciones")
    public ResponseEntity<List<ValidacionResponseDTO>> obtenerValidaciones(
            @PathVariable UUID reporteId) {
        try {
            log.info("Solicitando validaciones para reporte: {}", reporteId);

            if (!reporteRepository.existsById(reporteId)) {
                return ResponseEntity.notFound().build();
            }

            List<ValidacionReporte> validaciones = validacionRepository
                    .findByReporteIdOrderByFechaCreacionDesc(reporteId);

            List<ValidacionResponseDTO> response = validaciones.stream()
                    .map(v -> new ValidacionResponseDTO(
                            resolverNombreUsuario(v.getUsuarioEmail()),
                            v.getEsPositiva(),
                            v.getComentario(),
                            v.getFechaCreacion()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error al obtener validaciones para reporte {}: {}", reporteId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/v1/reportes/{reporteId}/validaciones
     * Crea una nueva validación. Reglas:
     *   - El usuario solo puede votar una vez por reporte (HTTP 400 si ya votó).
     *   - El email se extrae del JWT; el nombreUsuario se resuelve desde la BD.
     */
    @PostMapping("/{reporteId}/validaciones")
    public ResponseEntity<?> crearValidacion(
            @PathVariable UUID reporteId,
            @Valid @RequestBody ValidacionRequestDTO validacionRequest) {
        try {
            String usuarioEmail = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : "anonimo@accesimap.cl";

            log.info("Creando validación para reporte {} por usuario {}", reporteId, usuarioEmail);

            // ── Regla: 1 voto por usuario por reporte ──
            if (validacionRepository.existsByReporteIdAndUsuarioEmail(reporteId, usuarioEmail)) {
                log.warn("Intento de voto duplicado: usuario {} en reporte {}", usuarioEmail, reporteId);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "DUPLICATE_VOTE", "message", "Ya has validado este reporte."));
            }

            Reporte reporte = reporteRepository.findById(reporteId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporte no encontrado: " + reporteId));

            ValidacionReporte validacion = new ValidacionReporte();
            validacion.setReporte(reporte);
            validacion.setUsuarioEmail(usuarioEmail);
            validacion.setEsPositiva(validacionRequest.esPositiva());
            validacion.setComentario(validacionRequest.comentario() != null ? validacionRequest.comentario() : "");

            ValidacionReporte guardada = validacionRepository.save(validacion);

            // Procesar reglas de negocio y gamificación
            validacionCiudadanaService.procesarNuevaValidacion(reporteId, usuarioEmail, guardada);

            ValidacionResponseDTO response = new ValidacionResponseDTO(
                    resolverNombreUsuario(usuarioEmail),
                    guardada.getEsPositiva(),
                    guardada.getComentario(),
                    guardada.getFechaCreacion()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "NOT_FOUND", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al crear validación: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "SERVER_ERROR", "message", "Error al crear validación"));
        }
    }
}
