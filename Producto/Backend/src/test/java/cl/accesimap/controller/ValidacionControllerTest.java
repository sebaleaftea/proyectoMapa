package cl.accesimap.controller;

import cl.accesimap.domain.entity.ValidacionReporte;
import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.dto.ValidacionRequestDTO;
import cl.accesimap.dto.ValidacionResponseDTO;
import cl.accesimap.repository.ValidacionReporteRepository;
import cl.accesimap.repository.ReporteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios para ValidacionController.
 * Valida que el controlador maneje correctamente validaciones ciudadanas.
 */
@DisplayName("ValidacionController Tests")
class ValidacionControllerTest {

    @Mock
    private ValidacionReporteRepository validacionRepository;

@Mock
    private ReporteRepository reporteRepository;

    @Mock
    private cl.accesimap.service.ValidacionCiudadanaService validacionCiudadanaService;


    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ValidacionController validacionController;

    private UUID reporteId;
    private Reporte reporteMock;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        reporteId = UUID.randomUUID();
        
        // Mock del reporte
        reporteMock = new Reporte();
        reporteMock.setId(reporteId);
    }

    // ==================== Tests para GET /validaciones ====================

    @Test
    @DisplayName("Debe obtener todas las validaciones de un reporte")
    void testObtenerValidacionesSuccess() {
        // Arrange
        ValidacionReporte validacion1 = ValidacionReporte.builder()
                .id(1L)
                .reporte(reporteMock)
                .usuarioEmail("usuario1@gmail.com")
                .esPositiva(true)
                .comentario("Confirmo la existencia")
                .fechaCreacion(LocalDateTime.now())
                .build();

        ValidacionReporte validacion2 = ValidacionReporte.builder()
                .id(2L)
                .reporte(reporteMock)
                .usuarioEmail("usuario2@gmail.com")
                .esPositiva(false)
                .comentario("No lo confirmo")
                .fechaCreacion(LocalDateTime.now().minusHours(1))
                .build();

        List<ValidacionReporte> validaciones = List.of(validacion1, validacion2);

        when(reporteRepository.existsById(reporteId)).thenReturn(true);
        when(validacionRepository.findByReporteIdOrderByFechaCreacionDesc(reporteId))
                .thenReturn(validaciones);

        // Act
        ResponseEntity<List<ValidacionResponseDTO>> response = 
                validacionController.obtenerValidaciones(reporteId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("usuario1@gmail.com", response.getBody().get(0).usuarioEmail());
        assertEquals(true, response.getBody().get(0).esPositiva());
        verify(reporteRepository, times(1)).existsById(reporteId);
        verify(validacionRepository, times(1)).findByReporteIdOrderByFechaCreacionDesc(reporteId);
    }

    @Test
    @DisplayName("Debe retornar 404 si el reporte no existe")
    void testObtenerValidacionesReporteNotFound() {
        // Arrange
        when(reporteRepository.existsById(reporteId)).thenReturn(false);

        // Act
        ResponseEntity<List<ValidacionResponseDTO>> response = 
                validacionController.obtenerValidaciones(reporteId);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(reporteRepository, times(1)).existsById(reporteId);
        verify(validacionRepository, never()).findByReporteIdOrderByFechaCreacionDesc(any());
    }

    @Test
    @DisplayName("Debe retornar lista vacía si no hay validaciones")
    void testObtenerValidacionesEmpty() {
        // Arrange
        when(reporteRepository.existsById(reporteId)).thenReturn(true);
        when(validacionRepository.findByReporteIdOrderByFechaCreacionDesc(reporteId))
                .thenReturn(List.of());

        // Act
        ResponseEntity<List<ValidacionResponseDTO>> response = 
                validacionController.obtenerValidaciones(reporteId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    // ==================== Tests para POST /validaciones ====================

    @Test
    @DisplayName("Debe crear una validación exitosamente")
    void testCrearValidacionSuccess() {
        // Arrange
        ValidacionRequestDTO request = new ValidacionRequestDTO(true, "Confirmo la barrera");

        // Mock del SecurityContext
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("usuario@gmail.com");
        SecurityContextHolder.setContext(securityContext);

        when(reporteRepository.findById(reporteId)).thenReturn(Optional.of(reporteMock));

        ValidacionReporte validacionGuardada = ValidacionReporte.builder()
                .id(1L)
                .reporte(reporteMock)
                .usuarioEmail("usuario@gmail.com")
                .esPositiva(true)
                .comentario("Confirmo la barrera")
                .fechaCreacion(LocalDateTime.now())
                .build();

        when(validacionRepository.save(any(ValidacionReporte.class)))
                .thenReturn(validacionGuardada);

        doNothing().when(validacionCiudadanaService)
                .procesarNuevaValidacion(eq(reporteId), eq("usuario@gmail.com"), any(ValidacionReporte.class));


        // Act
        ResponseEntity<?> response = validacionController.crearValidacion(reporteId, request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody() instanceof ValidacionResponseDTO);
        ValidacionResponseDTO dto = (ValidacionResponseDTO) response.getBody();
        assertEquals("usuario@gmail.com", dto.usuarioEmail());
        assertEquals(true, dto.esPositiva());
        verify(validacionRepository, times(1)).save(any(ValidacionReporte.class));
    }

    @Test
    @DisplayName("Debe retornar 404 si el reporte no existe al crear validación")
    void testCrearValidacionReporteNotFound() {
        // Arrange
        ValidacionRequestDTO request = new ValidacionRequestDTO(true, "Comentario");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("usuario@gmail.com");
        SecurityContextHolder.setContext(securityContext);

        when(reporteRepository.findById(reporteId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = validacionController.crearValidacion(reporteId, request);

        // Assert
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Reporte no encontrado", response.getBody());
        verify(validacionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Debe crear validación sin comentario (null)")
    void testCrearValidacionSinComentario() {
        // Arrange
        ValidacionRequestDTO request = new ValidacionRequestDTO(false, null);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("usuario@gmail.com");
        SecurityContextHolder.setContext(securityContext);

        when(reporteRepository.findById(reporteId)).thenReturn(Optional.of(reporteMock));

        ValidacionReporte validacionGuardada = ValidacionReporte.builder()
                .id(1L)
                .reporte(reporteMock)
                .usuarioEmail("usuario@gmail.com")
                .esPositiva(false)
                .comentario("")
                .fechaCreacion(LocalDateTime.now())
                .build();

        when(validacionRepository.save(any(ValidacionReporte.class)))
                .thenReturn(validacionGuardada);

        // Act
        ResponseEntity<?> response = validacionController.crearValidacion(reporteId, request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ValidacionResponseDTO dto = (ValidacionResponseDTO) response.getBody();
        assertEquals(false, dto.esPositiva());
        assertNotNull(dto.comentario());
    }

    @Test
    @DisplayName("Debe usar email de SecurityContext")
    void testCrearValidacionExtractEmailDesdeSecurityContext() {
        // Arrange
        ValidacionRequestDTO request = new ValidacionRequestDTO(true, "Test");
        String emailDelUsuario = "juan.perez@example.com";

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(emailDelUsuario);
        SecurityContextHolder.setContext(securityContext);

        when(reporteRepository.findById(reporteId)).thenReturn(Optional.of(reporteMock));
        when(validacionRepository.save(any(ValidacionReporte.class)))
                .thenAnswer(invocation -> {
                    ValidacionReporte v = invocation.getArgument(0);
                    v.setId(1L);
                    return v;
                });

        // Act
        ResponseEntity<?> response = validacionController.crearValidacion(reporteId, request);

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ValidacionResponseDTO dto = (ValidacionResponseDTO) response.getBody();
        assertEquals(emailDelUsuario, dto.usuarioEmail());
    }

    @Test
    @DisplayName("Debe manejar excepciones del repositorio")
    void testCrearValidacionConException() {
        // Arrange
        ValidacionRequestDTO request = new ValidacionRequestDTO(true, "Test");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("usuario@gmail.com");
        SecurityContextHolder.setContext(securityContext);

        when(reporteRepository.findById(reporteId)).thenThrow(new RuntimeException("DB Error"));

        // Act
        ResponseEntity<?> response = validacionController.crearValidacion(reporteId, request);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Error al crear validación", response.getBody());
    }
}
