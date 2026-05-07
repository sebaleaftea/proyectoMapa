package cl.accesimap.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.locationtech.jts.geom.Polygon;

@Data
@Entity
@Table(name = "comunas")
@Getter
@Setter
public class Comuna {

    @Id
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, columnDefinition = "geometry(Polygon, 4326)")
    private Polygon poligono;
}
