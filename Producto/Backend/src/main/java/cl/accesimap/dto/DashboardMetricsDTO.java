package cl.accesimap.dto;

import java.math.BigDecimal;

/**
 * Record DTO que contiene las métricas clave del dashboard de riesgo municipal.
 * Calcula la exposición financiera a multas según la Ley 20.422.
 *
 * @param totalBarreras Cantidad total de barreras arquitectónicas validadas en la comuna
 * @param exposicionMaximaUtm Exposición máxima a multas en UTM (suma de multas máximas)
 */
public record DashboardMetricsDTO(
    Integer totalBarreras,
    BigDecimal exposicionMaximaUtm
) {}
