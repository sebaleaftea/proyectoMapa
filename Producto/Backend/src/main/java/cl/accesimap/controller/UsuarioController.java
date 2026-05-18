package cl.accesimap.controller;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.dto.ActualizarPerfilRequest;
import cl.accesimap.dto.PerfilUsuarioDTO;
import cl.accesimap.dto.ReporteDetalleDTO;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final ReporteRepository reporteRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private UUID extraerUsuarioId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return UUID.fromString(jwtUtil.extractUserId(token));
    }

    /**
     * GET /api/v1/usuarios/me
     * Retorna el perfil completo del usuario autenticado.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerMiPerfil(HttpServletRequest request) {
        UUID usuarioId = extraerUsuarioId(request);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        PerfilUsuarioDTO dto = new PerfilUsuarioDTO(
                usuario.getId().toString(),
                usuario.getEmail(),
                usuario.getNombreUsuario(),
                usuario.getPuntosGamificacion(),
                usuario.getFechaCreacion()
        );

        return ResponseEntity.ok(dto);
    }

    /**
     * PATCH /api/v1/usuarios/me
     * Actualiza nombre y/o contraseña del usuario autenticado.
     */
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> actualizarMiPerfil(
            @Valid @RequestBody ActualizarPerfilRequest req,
            HttpServletRequest request) {

        UUID usuarioId = extraerUsuarioId(request);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar nombre si viene
        if (req.getNombreUsuario() != null && !req.getNombreUsuario().isBlank()) {
            usuario.setNombreUsuario(req.getNombreUsuario().trim());
        }

        // Cambiar contraseña si vienen ambos campos
        if (req.getPasswordActual() != null && req.getPasswordNueva() != null) {
            if (!passwordEncoder.matches(req.getPasswordActual(), usuario.getPasswordHash())) {
                Map<String, String> error = new HashMap<>();
                error.put("mensaje", "La contraseña actual es incorrecta");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            usuario.setPasswordHash(passwordEncoder.encode(req.getPasswordNueva()));
        }

        usuarioRepository.save(usuario);

        PerfilUsuarioDTO dto = new PerfilUsuarioDTO(
                usuario.getId().toString(),
                usuario.getEmail(),
                usuario.getNombreUsuario(),
                usuario.getPuntosGamificacion(),
                usuario.getFechaCreacion()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("data", dto);
        response.put("mensaje", "Perfil actualizado correctamente");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/usuarios/me/reportes
     * Retorna el historial de reportes del usuario autenticado.
     */
    @GetMapping("/me/reportes")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> obtenerMisReportes(HttpServletRequest request) {
        UUID usuarioId = extraerUsuarioId(request);

        List<Reporte> reportes = reporteRepository.findByUsuarioId(usuarioId);

        List<ReporteDetalleDTO> dtos = reportes.stream()
                .map(r -> ReporteDetalleDTO.builder()
                        .id(r.getId())
                        .usuarioId(r.getUsuario().getId())
                        .categoria(r.getCategoria())
                        .descripcion(r.getDescripcion())
                        .fotoUrl(r.getFotoUrl())
                        .latitud(r.getUbicacion().getY())
                        .longitud(r.getUbicacion().getX())
                        .estado(r.getEstado())
                        .estadoElemento(r.getEstadoElemento())
                        .justificacionIa(r.getJustificacionIa())
                        .nivelConfianzaIa(r.getNivelConfianzaIa())
                        .fechaCreacion(r.getFechaCreacion())
                        .fechaActualizacion(r.getFechaActualizacion())
                        .build())
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("data", dtos);
        response.put("count", dtos.size());
        return ResponseEntity.ok(response);
    }

}
