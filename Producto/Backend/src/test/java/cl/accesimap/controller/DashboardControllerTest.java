package cl.accesimap.controller;

import cl.accesimap.dto.DashboardMetricsDTO;
import cl.accesimap.repository.ReporteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para DashboardController.
 * Valida que el controlador retorne métricas correctas y maneje errores apropiadamente.
 */
@DisplayName("DashboardController Tests")
class DashboardControllerTest {

    @Mock
    private ReporteRepository reporteRepository;

    @InjectMocks
    private DashboardController dashboardController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Debe retornar métricas de riesgo correctamente")
    void testObtenerRiesgoMunicipalSuccess() {
        // Arrange
        Integer comunaId = 1;
        DashboardMetricsDTO expected = new DashboardMetricsDTO(45, new BigDecimal("5670.50"));
        when(reporteRepository.calcularRiesgoComunal(comunaId))
            .thenReturn(expected);

        // Act
        ResponseEntity<?> response = dashboardController.obtenerRiesgoMunicipal(comunaId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(reporteRepository, times(1)).calcularRiesgoComunal(comunaId);
    }

    @Test
    @DisplayName("Debe retornar métricas vacías cuando no hay reportes validados")
    void testObtenerRiesgoMunicipalEmpty() {
        // Arrange
        Integer comunaId = 999;
        when(reporteRepository.calcularRiesgoComunal(comunaId))
            .thenReturn(null);

        // Act
        ResponseEntity<?> response = dashboardController.obtenerRiesgoMunicipal(comunaId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        DashboardMetricsDTO result = (DashboardMetricsDTO) response.getBody();
        assertEquals(0, result.totalBarreras());
        assertNull(result.exposicionMaximaUtm());
    }

    @Test
    @DisplayName("Debe manejar excepciones y retornar 500")
    void testObtenerRiesgoMunicipalException() {
        // Arrange
        Integer comunaId = 1;
        when(reporteRepository.calcularRiesgoComunal(anyInt()))
            .thenThrow(new RuntimeException("Error de base de datos"));

        // Act
        ResponseEntity<?> response = dashboardController.obtenerRiesgoMunicipal(comunaId);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("Error al obtener métricas"));
    }

    @Test
    @DisplayName("Debe calcular exposición máxima correctamente")
    void testExposicionMaximaCalculada() {
        // Arrange: 3 barreras con multas máximas de 100, 150 y 120 UTM = 370 UTM
        Integer comunaId = 1;
        DashboardMetricsDTO metrics = new DashboardMetricsDTO(
            3,
            new BigDecimal("370.00")
        );
        when(reporteRepository.calcularRiesgoComunal(comunaId))
            .thenReturn(metrics);

        // Act
        ResponseEntity<?> response = dashboardController.obtenerRiesgoMunicipal(comunaId);
        DashboardMetricsDTO result = (DashboardMetricsDTO) response.getBody();

        // Assert
        assertEquals(new BigDecimal("370.00"), result.exposicionMaximaUtm());
        assertEquals(3, result.totalBarreras());
    }

    @Test
    @DisplayName("Debe aceptar comunas con diferentes IDs")
    void testObtenerRiesgoParaDiferentescomunas() {
        // Arrange
        Integer[] comunaIds = {1, 2, 3, 99};
        DashboardMetricsDTO[] metricas = {
            new DashboardMetricsDTO(45, new BigDecimal("5670.50")),
            new DashboardMetricsDTO(23, new BigDecimal("2300.00")),
            new DashboardMetricsDTO(100, new BigDecimal("12500.75")),
            new DashboardMetricsDTO(0, BigDecimal.ZERO)
        };

        for (int i = 0; i < comunaIds.length; i++) {
            when(reporteRepository.calcularRiesgoComunal(comunaIds[i]))
                .thenReturn(metricas[i]);
        }

        // Act & Assert
        for (int i = 0; i < comunaIds.length; i++) {
            ResponseEntity<?> response = dashboardController.obtenerRiesgoMunicipal(comunaIds[i]);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertEquals(metricas[i], response.getBody());
        }
    }
}
