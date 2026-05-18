package cl.accesimap.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PerfilUsuarioDTO {
    private String id;
    private String email;
    private String nombreUsuario;
    private Integer puntosGamificacion;
    private LocalDateTime fechaCreacion;
}
