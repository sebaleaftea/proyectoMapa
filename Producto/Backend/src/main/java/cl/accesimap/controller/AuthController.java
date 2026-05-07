package cl.accesimap.controller;

import cl.accesimap.dto.AuthResponse;
import cl.accesimap.dto.LoginRequest;
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

        return ResponseEntity.ok(new AuthResponse(token, user.getId().toString(), user.getRol().name()));
    }
    
    @PostMapping("/registro")
    public ResponseEntity<?> registrarCiudadano(@Valid @RequestBody LoginRequest request) {
        if(usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email ya registrado");
        }
        
        Usuario newUser = new Usuario();
        newUser.setEmail(request.getEmail());
        newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        newUser.setRol(RolUsuario.CIUDADANO);
        
        usuarioRepository.save(newUser);
        
        return ResponseEntity.ok("Usuario registrado exitosamente");
    }
}
