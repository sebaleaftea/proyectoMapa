package cl.accesimap.service;

import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
}
