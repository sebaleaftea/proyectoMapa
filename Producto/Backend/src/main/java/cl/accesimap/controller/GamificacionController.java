package cl.accesimap.controller;

import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GamificacionController {

    @Autowired
    private  UsuarioRepository usuarioRepository;
    @Autowired
    private  JwtUtil jwtUtil;

    @GetMapping("/ranking")
    public ResponseEntity<?> obtenerRanking() {
        List<Usuario> rankingList = usuarioRepository.findAll().stream()
                .filter(u -> u.getPuntosGamificacion() > 0)
                .sorted(Comparator.comparingInt(Usuario::getPuntosGamificacion).reversed())
                .collect(Collectors.toList());

        List<Map<String, Object>> responseList = new ArrayList<>();
        int position = 1;
        for (Usuario u : rankingList) {
            Map<String, Object> map = new HashMap<>();
            map.put("posicion", position++);
            map.put("usuarioId", u.getId());
            // Si es anonimo no revelamos nombre o correo, solo un alias anonimo
            map.put("alias", u.getEsAnonimo() ? "Anonimo_" + u.getId().toString().substring(0, 4) : u.getEmail());
            map.put("puntos", u.getPuntosGamificacion());
            responseList.add(map);
        }

        Map<String, Object> root = new HashMap<>();
        root.put("data", responseList);
        
        return ResponseEntity.ok(root);
    }
    
    @GetMapping("/usuarios/me/puntos")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<?> obtenerMisPuntos(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        UUID usuarioId = UUID.fromString(jwtUtil.extractUserId(token));
        
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", usuario.getId());
        data.put("email", usuario.getEmail());
        data.put("puntos", usuario.getPuntosGamificacion());
        
        return ResponseEntity.ok(data);
    }
}
