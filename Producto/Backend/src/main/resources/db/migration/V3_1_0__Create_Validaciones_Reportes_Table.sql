-- ============================================================================
-- MIGRACION: Crear tabla de Validaciones Ciudadanas
-- ============================================================================
-- Archivo: V3_1_0__Create_Validaciones_Reportes_Table.sql
-- Descripción: Crea la tabla validaciones_reportes para almacenar 
--              validaciones ciudadanas de reportes (Like/Dislike)
-- Versión: 1.0
-- Fecha: Mayo 2026
-- ============================================================================

-- Crear tabla de validaciones ciudadanas
CREATE TABLE IF NOT EXISTS validaciones_reportes (
    id BIGSERIAL PRIMARY KEY,
    
    -- Referencia al reporte que está siendo validado
    reporte_id UUID NOT NULL,
    
    -- Email del usuario que realizó la validación
    -- Extraído del JWT token en el backend
    usuario_email VARCHAR(255) NOT NULL,
    
    -- Voto del usuario: TRUE = Confirmo/Positivo, FALSE = No Confirmo/Negativo
    es_positiva BOOLEAN NOT NULL,
    
    -- Comentario opcional del validador (máximo 500 caracteres)
    comentario VARCHAR(500),
    
    -- Timestamp de creación (automático)
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Llave foránea hacia la tabla reportes
    -- ON DELETE CASCADE: si se elimina el reporte, se eliminan sus validaciones
    CONSTRAINT fk_validaciones_reportes 
        FOREIGN KEY (reporte_id) 
        REFERENCES reportes(id) 
        ON DELETE CASCADE
);

-- ============================================================================
-- INDICES PARA PERFORMANCE
-- ============================================================================

-- Índice sobre reporte_id para búsquedas rápidas por reporte
CREATE INDEX IF NOT EXISTS idx_validaciones_reporte 
    ON validaciones_reportes(reporte_id);

-- Índice compuesto para consultas frecuentes
-- (búsqueda de validaciones de un reporte, ordenadas por fecha descendente)
CREATE INDEX IF NOT EXISTS idx_validaciones_reporte_fecha 
    ON validaciones_reportes(reporte_id DESC, fecha_creacion DESC);

-- Índice sobre usuario_email para posibles análisis futuros
CREATE INDEX IF NOT EXISTS idx_validaciones_usuario 
    ON validaciones_reportes(usuario_email);

-- Índice sobre es_positiva para filtrar por voto
CREATE INDEX IF NOT EXISTS idx_validaciones_voto 
    ON validaciones_reportes(es_positiva);

-- ============================================================================
-- COMENTARIOS EN LA TABLA
-- ============================================================================

COMMENT ON TABLE validaciones_reportes IS 
    'Almacena las validaciones ciudadanas de reportes de barreras arquitectónicas. 
     Cada validación consiste en un voto (Like/Dislike) y un comentario opcional.
     Los usuarios pueden validar múltiples reportes y un mismo reporte puede 
     tener validaciones de múltiples usuarios.';

COMMENT ON COLUMN validaciones_reportes.id IS 
    'Identificador único de la validación (auto-incrementado)';

COMMENT ON COLUMN validaciones_reportes.reporte_id IS 
    'UUID del reporte que está siendo validado. Referencia a reportes.id';

COMMENT ON COLUMN validaciones_reportes.usuario_email IS 
    'Email del usuario que realizó la validación, extraído del JWT token';

COMMENT ON COLUMN validaciones_reportes.es_positiva IS 
    'Voto del ciudadano: true=Confirmo (positivo), false=No Confirmo (negativo)';

COMMENT ON COLUMN validaciones_reportes.comentario IS 
    'Comentario opcional del validador explicando su voto (máximo 500 caracteres)';

COMMENT ON COLUMN validaciones_reportes.fecha_creacion IS 
    'Timestamp de cuando se creó la validación (automático)';

-- ============================================================================
-- VERIFICACIÓN POST-CREACIÓN
-- ============================================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'validaciones_reportes'
ORDER BY ordinal_position;

-- Verificar índices creados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename = 'validaciones_reportes'
ORDER BY indexname;

-- ============================================================================
-- DATOS INICIALES DE PRUEBA (OPCIONAL - eliminar en producción)
-- ============================================================================

-- Insertar validaciones de ejemplo (solo para desarrollo/testing)
-- DESCOMENTAR SOLO SI TIENES REPORTES EXISTENTES
/*
INSERT INTO validaciones_reportes 
    (reporte_id, usuario_email, es_positiva, comentario, fecha_creacion)
VALUES
    (
        (SELECT id FROM reportes LIMIT 1),
        'usuario1@example.com',
        true,
        'Confirmo que esta rampa está rota y necesita reparación',
        CURRENT_TIMESTAMP
    ),
    (
        (SELECT id FROM reportes LIMIT 1),
        'usuario2@example.com',
        false,
        'No veo ningún problema en este lugar',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    );
*/

-- ============================================================================
-- ROLLBACK (En caso de necesitar revertir)
-- ============================================================================

-- Para revertir esta migración, ejecutar:
-- DROP TABLE IF EXISTS validaciones_reportes CASCADE;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
