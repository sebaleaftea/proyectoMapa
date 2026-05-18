package cl.accesimap.controller;

import cl.accesimap.dto.AuthResponse;
import cl.accesimap.dto.LoginRequest;
import cl.accesimap.dto.RegistroRequest;
import cl.accesimap.domain.entity.Usuario;
import cl.accesimap.domain.enums.RolUsuario;
import cl.accesimap.repository.UsuarioRepository;
import cl.accesimap.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@Valid @RequestBody LoginRequest request) {
        Usuario user = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRol().name(), user.getId().toString());

        return ResponseEntity.ok(new AuthResponse(token, user.getId().toString(), user.getRol().name(), user.getNombreUsuario()));
    }
    
    @PostMapping("/registro")
    public ResponseEntity<?> registrarCiudadano(@Valid @RequestBody RegistroRequest request) {
        if(usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("El correo electrónico ya se encuentra registrado");
        }
        
        Usuario newUser = new Usuario();
        newUser.setEmail(request.getEmail());
        newUser.setNombreUsuario(request.getNombreUsuario().trim());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRol(RolUsuario.CIUDADANO);
        newUser.setEsAnonimo(request.getEsAnonimo() != null ? request.getEsAnonimo() : false);
        
        usuarioRepository.save(newUser);

        // Generar token JWT para auto-login tras registro
        String token = jwtUtil.generateToken(newUser.getEmail(), newUser.getRol().name(), newUser.getId().toString());
        
        return ResponseEntity.ok(new AuthResponse(token, newUser.getId().toString(), newUser.getRol().name(), newUser.getNombreUsuario()));
    }
}

