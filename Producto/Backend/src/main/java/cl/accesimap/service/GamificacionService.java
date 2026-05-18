package cl.accesimap.service;

import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificacionService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public void otorgarPuntosPorValidacion(UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        usuario.setPuntosGamificacion(usuario.getPuntosGamificacion() + 10);
        usuarioRepository.save(usuario);
    }
    
    public List<Map<String, Object>> obtenerTop20(String tipo) {
        // TODO: Implementar logica real para mensual cuando existan datos en BD
        List<Usuario> rankingList = usuarioRepository.findAll().stream()
                .filter(u -> u.getPuntosGamificacion() > 0)
                .sorted(Comparator.comparingInt(Usuario::getPuntosGamificacion).reversed())
                .collect(Collectors.toList());

        List<Map<String, Object>> responseList = new ArrayList<>();
        int rank = 1;
        int currentPoints = -1;
        int elementCount = 0;

        for (Usuario u : rankingList) {
            if (u.getPuntosGamificacion() != currentPoints) {
                if (elementCount >= 20) break;
                rank = elementCount + 1;
                currentPoints = u.getPuntosGamificacion();
            } else if (elementCount >= 20) {
                // If it's a tie, we might include them even if count >= 20 so they share the spot
                // But for simplicity, we allow adding them if they share the rank, else break.
            }
            
            Map<String, Object> map = new HashMap<>();
            map.put("posicion", rank);
            map.put("usuarioId", u.getId());
            map.put("nombre", u.getNombreUsuario() != null ? u.getNombreUsuario() : u.getEmail().split("@")[0]);
            map.put("puntos", u.getPuntosGamificacion());
            map.put("cantidadReportes", u.getPuntosGamificacion() / 10);
            responseList.add(map);
            elementCount++;
        }
        return responseList;
    }

    public int obtenerPosicionUsuario(UUID usuarioId, String tipo) {
        List<Map<String, Object>> topTotal = obtenerTop20(tipo); 
        for (Map<String, Object> map : topTotal) {
            if (map.get("usuarioId").equals(usuarioId)) {
                return (int) map.get("posicion");
            }
        }
        return 999;
    }
}
