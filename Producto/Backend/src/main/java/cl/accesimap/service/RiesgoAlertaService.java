package cl.accesimap.service;

import cl.accesimap.dto.DashboardMetricsDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@Slf4j
public class RiesgoAlertaService {

    private static final BigDecimal UMBRAL_RIESGO = new BigDecimal("1000.00");

    public void validarYGenerarAlertas(Integer comunaId, DashboardMetricsDTO metrics) {
        if (metrics.exposicionMaximaUtm() != null && metrics.exposicionMaximaUtm().compareTo(UMBRAL_RIESGO) > 0) {
            log.warn("⚠️ ALERTA: Comuna {} excede umbral de exposición a multas ({} UTM)", comunaId, metrics.exposicionMaximaUtm());
            enviarNotificacionAMunicipalidad(comunaId, metrics);
        }
    }

    private void enviarNotificacionAMunicipalidad(Integer comunaId, DashboardMetricsDTO metrics) {
        // En un caso real, esto enviaría un email o un mensaje websocket.
        log.info("Notificación enviada a la municipalidad de comuna {} sobre riesgo crítico.", comunaId);
    }
}
