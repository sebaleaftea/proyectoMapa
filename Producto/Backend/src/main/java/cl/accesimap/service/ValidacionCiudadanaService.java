package cl.accesimap.service;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.domain.entity.ValidacionReporte;
import cl.accesimap.domain.enums.EstadoReporte;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.repository.ValidacionReporteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Servicio para gestionar la lógica de validación ciudadana, gamificación y transición de estados.
 *
 * Reglas de Negocio:
 * 1. Fórmula de Validación Ciudadana: (Validaciones Positivas / Total) * 100
 * 2. Regla de Estado VALIDADO:
 *    - Si IA Confianza > 80% Y Aprobación Ciudadana > 80% → estado = 'VALIDADO'
 *    - EXCEPCIÓN: Si no hay validaciones ciudadanas pero IA > 80% → estado = 'VALIDADO'
 * 3. Gamificación: +10 puntos por cada validación realizada
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ValidacionCiudadanaService {

    private final ValidacionReporteRepository validacionRepository;
    private final ReporteRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Constantes de negocio
     */
    private static final float UMBRAL_CONFIANZA_IA = 80.0f;
    private static final double UMBRAL_APROBACION_CIUDADANA = 80.0;
    private static final int PUNTOS_POR_VALIDACION = 10;

    /**
     * Procesa una nueva validación ciudadana y ejecuta la lógica de negocio.
     *
     * Operaciones:
     * 1. Incrementa puntos del usuario validador
     * 2. Calcula porcentaje de aprobación ciudadana
     * 3. Verifica si el reporte debe pasar a estado VALIDADO
     * 4. Actualiza el reporte si es necesario
     *
     * @param reporteId ID del reporte validado
     * @param usuarioEmail Email del usuario que valida
     * @param validacion Entidad ValidacionReporte recién creada
     */
    @Transactional
    public void procesarNuevaValidacion(UUID reporteId, String usuarioEmail, ValidacionReporte validacion) {
        log.info("Procesando nueva validación para reporte: {} desde usuario: {}", reporteId, usuarioEmail);

        try {
            // Paso 1: Incrementar puntos del usuario
            incrementarPuntosUsuario(usuarioEmail);

            // Paso 2: Obtener el reporte
            Reporte reporte = reporteRepository.findById(reporteId)
                    .orElseThrow(() -> new IllegalArgumentException("Reporte no encontrado: " + reporteId));

            // Paso 3: Calcular porcentaje de aprobación ciudadana
            double porcentajeCiudadano = calcularPorcentajeCiudadano(reporteId);

            // Paso 4: Verificar reglas de transición de estado
            verificarYActualizarEstado(reporte, porcentajeCiudadano);

            // Paso 5: Guardar cambios
            reporteRepository.save(reporte);

            log.info("Validación procesada exitosamente. Reporte {} ahora en estado: {}", 
                    reporteId, reporte.getEstado());

        } catch (Exception e) {
            log.error("Error al procesar validación ciudadana para reporte {}: {}", 
                    reporteId, e.getMessage(), e);
            // No lanzar excepción para no revertir la validación guardada
            // El error se loguea pero la validación persiste
        }
    }

    /**
     * Incrementa el campo puntosGamificacion del usuario en 10 puntos.
     *
     * @param usuarioEmail Email del usuario
     */
    private void incrementarPuntosUsuario(String usuarioEmail) {
        log.debug("Incrementando puntos para usuario: {}", usuarioEmail);

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + usuarioEmail));

        int puntosActuales = usuario.getPuntosGamificacion() != null ? usuario.getPuntosGamificacion() : 0;
        usuario.setPuntosGamificacion(puntosActuales + PUNTOS_POR_VALIDACION);

        usuarioRepository.save(usuario);

        log.info("Puntos incrementados para usuario: {}. Nuevo total: {}", 
                usuarioEmail, usuario.getPuntosGamificacion());
    }

    /**
     * Calcula el porcentaje de aprobación ciudadana para un reporte.
     *
     * Fórmula: (Validaciones Positivas / Total de Validaciones) * 100
     *
     * @param reporteId ID del reporte
     * @return Porcentaje de aprobación (0-100), o 0 si no hay validaciones
     */
    public double calcularPorcentajeCiudadano(UUID reporteId) {
        List<ValidacionReporte> validaciones = validacionRepository
                .findByReporteIdOrderByFechaCreacionDesc(reporteId);

        if (validaciones.isEmpty()) {
            log.debug("No hay validaciones ciudadanas para reporte: {}", reporteId);
            return 0.0;
        }

        long validacionesPositivas = validaciones.stream()
                .filter(ValidacionReporte::getEsPositiva)
                .count();

        double porcentaje = (validacionesPositivas / (double) validaciones.size()) * 100.0;

        log.debug("Reporte {}: {} positivas de {} totales = {:.2f}%", 
                reporteId, validacionesPositivas, validaciones.size(), porcentaje);

        return Math.round(porcentaje * 100.0) / 100.0; // Redondear a 2 decimales
    }

    /**
     * Cuenta el total de validaciones ciudadanas para un reporte.
     *
     * @param reporteId ID del reporte
     * @return Número total de validaciones
     */
    public int contarValidacionesCiudadanas(UUID reporteId) {
        List<ValidacionReporte> validaciones = validacionRepository
                .findByReporteIdOrderByFechaCreacionDesc(reporteId);
        return validaciones.size();
    }

    /**
     * Verifica las reglas de transición de estado y actualiza el reporte si corresponde.
     *
     * Reglas:
     * 1. Si IA > 80% Y Aprobación Ciudadana > 80% → VALIDADO
     * 2. Si IA > 80% pero NO hay validaciones ciudadanas → VALIDADO (excepción)
     * 3. En cualquier otro caso → mantener estado actual
     *
     * @param reporte Entidad Reporte a evaluar
     * @param porcentajeCiudadano Porcentaje de aprobación ciudadana (0 si no hay)
     */
    private void verificarYActualizarEstado(Reporte reporte, double porcentajeCiudadano) {
        Float confianzaIa = reporte.getNivelConfianzaIa();

        if (confianzaIa == null) {
            log.debug("Reporte {} no tiene evaluación IA. Estado no cambia.", reporte.getId());
            return;
        }

        log.debug("Verificando transición de estado para reporte {}. IA: {}%, Ciudadano: {}%", 
                reporte.getId(), confianzaIa, porcentajeCiudadano);

        // Solo cambiar estado si está en PENDIENTE
        if (reporte.getEstado() != EstadoReporte.PENDIENTE) {
            log.debug("Reporte {} no está en PENDIENTE. Estado actual: {}. No se modifica.", 
                    reporte.getId(), reporte.getEstado());
            return;
        }

        // Regla 2: Excepción - Si IA > 80% pero no hay validaciones ciudadanas
        if (confianzaIa > UMBRAL_CONFIANZA_IA && porcentajeCiudadano == 0) {
            log.info("Reporte {} cumple excepción (IA > 80% sin validaciones ciudadanas). " +
                    "Pasando a VALIDADO.", reporte.getId());
            reporte.setEstado(EstadoReporte.VALIDADO);
            return;
        }

        // Regla 1: Si IA > 80% Y Aprobación Ciudadana > 80%
        if (confianzaIa > UMBRAL_CONFIANZA_IA && porcentajeCiudadano > UMBRAL_APROBACION_CIUDADANA) {
            log.info("Reporte {} cumple ambos criterios (IA: {}%, Ciudadano: {}%). " +
                    "Pasando a VALIDADO.", reporte.getId(), confianzaIa, porcentajeCiudadano);
            reporte.setEstado(EstadoReporte.VALIDADO);
            return;
        }

        log.debug("Reporte {} no cumple criterios de transición. " +
                "IA: {}%, Ciudadano: {}%. Se mantiene PENDIENTE.",
                reporte.getId(), confianzaIa, porcentajeCiudadano);
    }

    /**
     * Obtiene el porcentaje de aprobación ciudadana para un reporte, o null si no hay validaciones.
     * Útil para exponer en la API.
     *
     * @param reporteId ID del reporte
     * @return Porcentaje (Double) o null si no hay validaciones
     */
    public Double obtenerPorcentajeCiudadanoONull(UUID reporteId) {
        List<ValidacionReporte> validaciones = validacionRepository
                .findByReporteIdOrderByFechaCreacionDesc(reporteId);

        if (validaciones.isEmpty()) {
            return null;
        }

        return calcularPorcentajeCiudadano(reporteId);
    }
}
