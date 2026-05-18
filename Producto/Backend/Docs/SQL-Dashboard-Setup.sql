-- ============================================================================
-- SCRIPT SQL: Tablas y Datos de Ejemplo para Dashboard de Riesgo Municipal
-- ============================================================================
-- Ley 20.422: Sistema de Accesibilidad de Establecimientos Públicos
-- ============================================================================

-- 1. Crear tabla normativa_multas (si no existe)
CREATE TABLE IF NOT EXISTS normativa_multas (
    id BIGSERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL UNIQUE,
    articulo_ley VARCHAR(100) NOT NULL,
    multa_min_utm DECIMAL(10, 2) NOT NULL,
    multa_max_utm DECIMAL(10, 2) NOT NULL,
    gravedad VARCHAR(50) NOT NULL, -- LEVE, GRAVE, MUY_GRAVE
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear índice en categoría para joins rápidos
CREATE INDEX idx_normativa_multas_categoria ON normativa_multas(categoria);

-- 3. Insertar datos de ejemplo (Ley 20.422)
INSERT INTO normativa_multas (categoria, articulo_ley, multa_min_utm, multa_max_utm, gravedad)
VALUES
    ('RAMPA', 'Art. 47 - Acceso a rampas', 20.00, 100.00, 'GRAVE'),
    ('ASCENSOR', 'Art. 48 - Acceso a ascensores', 30.00, 150.00, 'MUY_GRAVE'),
    ('BAÑO', 'Art. 49 - Baños accesibles', 25.00, 120.00, 'GRAVE'),
    ('ESTACIONAMIENTO', 'Art. 46 - Estacionamiento accesible', 15.00, 80.00, 'LEVE'),
    ('SIGNALETICA', 'Art. 50 - Señalética accesible', 10.00, 50.00, 'LEVE')
ON CONFLICT (categoria) DO NOTHING;

-- 4. Verificar que las comunas tienen polígonos válidos
-- (Asumir que la tabla comunas ya existe con columna poligono geometry(Polygon, 4326))
SELECT COUNT(*) as total_comunas, 
       COUNT(CASE WHEN poligono IS NOT NULL THEN 1 END) as comunas_con_poligono
FROM comunas;

-- 5. Validar integridad espacial: todos los reportes deben estar dentro de un polígono
SELECT COUNT(*) as reportes_fuera_poligono
FROM reportes r
WHERE NOT EXISTS (
    SELECT 1 FROM comunas c 
    WHERE ST_Contains(c.poligono, r.ubicacion)
);

-- 6. Vista de ayuda: Reporte de riesgo por comuna (OPCIONAL, para desarrollo)
CREATE OR REPLACE VIEW v_riesgo_municipal AS
SELECT 
    c.id as comuna_id,
    c.nombre as comuna,
    COUNT(DISTINCT r.id) as total_barreras_validadas,
    COALESCE(SUM(nm.multa_max_utm), 0) as exposicion_maxima_utm,
    COALESCE(SUM(nm.multa_max_utm) * 65000, 0) as exposicion_clp_aprox
FROM comunas c
LEFT JOIN reportes r ON (
    ST_Contains(c.poligono, r.ubicacion) 
    AND r.estado = 'VALIDADO'
    AND r.estado_elemento = 'MAL_ESTADO'
)
LEFT JOIN normativa_multas nm ON CAST(r.categoria AS VARCHAR) = nm.categoria
GROUP BY c.id, c.nombre
ORDER BY exposicion_maxima_utm DESC;

-- 7. Consulta de prueba: Ver riesgo para una comuna específica
-- Reemplazar 1 con el ID de la comuna que desees consultar
SELECT *
FROM v_riesgo_municipal
WHERE comuna_id = 1;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. La tabla normativa_multas debe tener un registro por CADA categoría
--    definida en CategoriaInfraestructura enum del backend (Java)
--
-- 2. Los valores de multas están en UTM (Unidad Tributaria Mensual).
--    Conversión aprox para 2024: 1 UTM ≈ $65,000 CLP
--
-- 3. El estado_elemento en reportes debe ser:
--    - 'BUEN_ESTADO': No genera multa
--    - 'MAL_ESTADO': Genera exposición a multa
--
-- 4. La columna estado en reportes debe ser:
--    - 'PENDIENTE': En evaluación
--    - 'VALIDADO': Confirmado, cuenta para dashboard
--    - 'RECHAZADO': No cuenta para dashboard
--
-- 5. La consulta del backend usa ST_Within en lugar de ST_Contains:
--    - ST_Contains: Punto completamente dentro
--    - ST_Within: Más estricto pero similar
--    Ajusta según necesidad en ReporteRepository.calcularRiesgoComunal()
-- ============================================================================
