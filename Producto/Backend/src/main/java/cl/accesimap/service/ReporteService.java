package cl.accesimap.service;

import java.io.IOException;

import cl.accesimap.domain.entity.Reporte;
import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.domain.enums.CategoriaInfraestructura;
import cl.accesimap.domain.enums.EstadoReporte;
import cl.accesimap.dto.ReporteDetalleDTO;
import cl.accesimap.repository.ReporteRepository;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.service.ai.AzureVisionFacade;
import cl.accesimap.service.ai.ValidacionGeminiService;
import cl.accesimap.service.storage.AlmacenamientoService;
import lombok.RequiredArgsConstructor;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReporteService {

    @Autowired
    private ReporteRepository reporteRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AlmacenamientoService almacenamientoService;
    @Autowired
    private AzureVisionFacade azureVisionFacade;
    @Autowired
    private GamificacionService gamificacionService;
    @Autowired
    private GeometryFactory geometryFactory;
    @Autowired
    private ValidacionGeminiService geminiService;

    @Transactional
    public Reporte procesarNuevoReporte(MultipartFile archivo, Double latitud, Double longitud,
            CategoriaInfraestructura categoria, String descripcion, UUID usuarioId) throws IOException {

        // 1. Convertir imagen para Gemini
        String imagenBase64 = java.util.Base64.getEncoder().encodeToString(archivo.getBytes());

        // 2. Subir a Azure Storage (IaaS)
        String fotoUrl = almacenamientoService.subirFotoSegura(archivo);

        // 3. Consultar a Gemini (SaaS)[cite: 5]
        var resultadoIA = geminiService.analizarImagen(imagenBase64, categoria.name());

        // 4. Crear entidad Reporte
        Reporte reporte = new Reporte();
        reporte.setFotoUrl(fotoUrl);
        reporte.setCategoria(categoria);
        reporte.setDescripcion(descripcion);
        reporte.setNivelConfianzaIa(resultadoIA.nivelConfianza());
        reporte.setEstadoElemento(resultadoIA.estadoElemento());
        reporte.setJustificacionIa(resultadoIA.justificacion()); // Asignamos la nueva justificación

        // --- CORRECCIONES CRÍTICAS AQUÍ ---

        // 4.1 Asignar el Punto Geográfico (PostGIS)
        // Importante: JTS Point recibe las coordenadas en orden (Longitud, Latitud)
        Point ubicacion = geometryFactory.createPoint(new org.locationtech.jts.geom.Coordinate(longitud, latitud));
        reporte.setUbicacion(ubicacion);

        // 4.2 Asignar el Usuario (FK)
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));
        reporte.setUsuario(usuario);

        // --- FIN CORRECCIONES ---

        // 5. Aplicar la Lógica de Validación Doble (Umbral 85%)[cite: 3]
        if (resultadoIA.nivelConfianza() >= 0.85f &&
                resultadoIA.categoriaDetectada().equalsIgnoreCase(categoria.name())) {
            reporte.setEstado(EstadoReporte.VALIDADO);

            // Sumar puntos al usuario (Gamificación)[cite: 3]
            usuario.setPuntosGamificacion(usuario.getPuntosGamificacion() + 10);
            usuarioRepository.save(usuario);

        } else {
            reporte.setEstado(EstadoReporte.PENDIENTE);
        }

        // 6. Guardar en Base de Datos Espacial
        return reporteRepository.save(reporte);
    }

    @Transactional(readOnly = true)
    public ReporteDetalleDTO obtenerReportePorId(UUID id) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado con ID: " + id));

        return ReporteDetalleDTO.builder()
                .id(reporte.getId())
                .usuarioId(reporte.getUsuario().getId())
                .categoria(reporte.getCategoria())
                .descripcion(reporte.getDescripcion())
                .fotoUrl(reporte.getFotoUrl())
                .latitud(reporte.getUbicacion().getY())
                .longitud(reporte.getUbicacion().getX())
                .estado(reporte.getEstado())
                .estadoElemento(reporte.getEstadoElemento())
                .justificacionIa(reporte.getJustificacionIa())
                .nivelConfianzaIa(reporte.getNivelConfianzaIa())
                .fechaCreacion(reporte.getFechaCreacion())
                .fechaActualizacion(reporte.getFechaActualizacion())
                .build();
    }

    @Transactional
    public Reporte cambiarEstado(UUID id, EstadoReporte nuevoEstado) {
        Reporte reporte = reporteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));

        EstadoReporte estadoPrevio = reporte.getEstado();
        reporte.setEstado(nuevoEstado);
        reporteRepository.save(reporte);

        if (estadoPrevio != EstadoReporte.VALIDADO && nuevoEstado == EstadoReporte.VALIDADO) {
            gamificacionService.otorgarPuntosPorValidacion(reporte.getUsuario().getId());
        }

        return reporte;
    }
}
