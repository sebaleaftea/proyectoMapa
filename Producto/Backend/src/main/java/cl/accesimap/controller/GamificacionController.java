package cl.accesimap.controller;

import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.security.JwtUtil;
import cl.accesimap.service.GamificacionService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class GamificacionController {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private GamificacionService gamificacionService;

    @GetMapping("/ranking")
    public ResponseEntity<?> obtenerRanking(@RequestParam(defaultValue = "global") String tipo) {
        List<Map<String, Object>> responseList = gamificacionService.obtenerTop20(tipo);

        Map<String, Object> root = new HashMap<>();
        root.put("data", responseList);
        
        return ResponseEntity.ok(root);
    }
    
    @GetMapping("/usuarios/me/puntos")
    @PreAuthorize("hasRole('CIUDADANO')")
    public ResponseEntity<?> obtenerMisPuntos(HttpServletRequest request,
                                              @RequestParam(defaultValue = "global") String tipo) {
        String token = request.getHeader("Authorization").substring(7);
        UUID usuarioId = UUID.fromString(jwtUtil.extractUserId(token));
        
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        
        int posicion = gamificacionService.obtenerPosicionUsuario(usuarioId, tipo);
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", usuario.getId());
        data.put("email", usuario.getEmail());
        data.put("puntos", usuario.getPuntosGamificacion());
        data.put("posicion", posicion);
        
        return ResponseEntity.ok(data);
    }
}
