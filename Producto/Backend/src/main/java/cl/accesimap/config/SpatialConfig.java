package cl.accesimap.config;

import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpatialConfig {

    @Bean
    public GeometryFactory geometryFactory() {
        // SRID 4326 representa el estándar WGS 84 (Latitud/Longitud de GPS)
        // Requerido por el modelo de datos para PostGIS
        return new GeometryFactory(new PrecisionModel(), 4326);
    }
}
