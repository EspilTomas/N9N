-- Script de configuración para la base de datos Nazar en Supabase
-- Conexión: postgresql://postgres.llpphdvyaycqpcprlzcy:[YOUR-PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres

-- Eliminar tablas existentes si existen (para empezar limpio)
DROP TABLE IF EXISTS viajes CASCADE;
DROP TABLE IF EXISTS ramplas CASCADE;
DROP TABLE IF EXISTS tractos CASCADE;
DROP TABLE IF EXISTS conductores CASCADE;

-- Crear tabla de conductores
CREATE TABLE conductores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    licencia VARCHAR(50) NOT NULL,
    turno VARCHAR(50) NOT NULL CHECK (turno IN ('Mañana', 'Tarde', 'Noche')),
    horas_disponibles INTEGER DEFAULT 8 CHECK (horas_disponibles >= 0),
    horas_usadas_mes INTEGER DEFAULT 0 CHECK (horas_usadas_mes >= 0 AND horas_usadas_mes <= 180),
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tractos
CREATE TABLE tractos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patente VARCHAR(20) UNIQUE NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    año VARCHAR(4) NOT NULL,
    color VARCHAR(50) NOT NULL,
    acreditaciones TEXT,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ramplas
CREATE TABLE ramplas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    capacidad VARCHAR(50) NOT NULL,
    rev_tecnica DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de viajes
CREATE TABLE viajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_viaje VARCHAR(20) UNIQUE NOT NULL,
    cliente VARCHAR(100) NOT NULL CHECK (cliente IN ('FALABELLA', 'CODELCO', 'WALMART')),
    ruta VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    conductor_id UUID REFERENCES conductores(id) ON DELETE SET NULL,
    conductor_nombre VARCHAR(255) NOT NULL,
    tracto_patente VARCHAR(20) NOT NULL,
    rampla_codigo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) DEFAULT 'agendado' CHECK (estado IN ('agendado', 'en-curso', 'completado')),
    horas_estimadas INTEGER NOT NULL CHECK (horas_estimadas > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales para conductores
INSERT INTO conductores (nombre, licencia, turno, horas_disponibles, horas_usadas_mes, estado) VALUES
('Juan Pérez', 'A3-A4', 'Mañana', 8, 120, 'disponible'),
('María González', 'A3-A4', 'Tarde', 0, 160, 'ocupado'),
('Carlos Rodríguez', 'A3-A4', 'Noche', 6, 90, 'mantenimiento'),
('Ana López', 'A3-A4', 'Mañana', 8, 45, 'disponible'),
('Pedro Martínez', 'A3-A4', 'Tarde', 8, 75, 'disponible'),
('Carmen Silva', 'A3-A4', 'Noche', 4, 140, 'disponible');

-- Insertar datos iniciales para tractos
INSERT INTO tractos (patente, modelo, año, color, acreditaciones, estado) VALUES
('AB-1234', 'Volvo FH', '2020', 'Blanco', 'Puerto, Zona Franca', 'disponible'),
('CD-5678', 'Scania R450', '2019', 'Azul', 'General', 'ocupado'),
('EF-9012', 'Mercedes Actros', '2021', 'Blanco', 'Puerto', 'mantenimiento'),
('GH-3456', 'Volvo FH16', '2022', 'Rojo', 'Puerto, Zona Franca', 'disponible'),
('IJ-7890', 'Scania S500', '2020', 'Verde', 'General', 'disponible');

-- Insertar datos iniciales para ramplas
INSERT INTO ramplas (codigo, tipo, capacidad, rev_tecnica, estado) VALUES
('R001', 'Rampla Seca', '25 ton', '2025-12-15', 'disponible'),
('R002', 'Multitemperatura', '20 ton', '2025-11-20', 'ocupado'),
('R003', 'Cisterna', '30 ton', '2025-08-10', 'mantenimiento'),
('R004', 'Rampla Seca', '28 ton', '2025-10-30', 'disponible'),
('R005', 'Contenedor', '22 ton', '2025-09-15', 'disponible');

-- Insertar datos iniciales para viajes (usando IDs reales de conductores)
DO $$
DECLARE
    conductor1_id UUID;
    conductor2_id UUID;
BEGIN
    -- Obtener IDs de conductores
    SELECT id INTO conductor1_id FROM conductores WHERE nombre = 'Juan Pérez' LIMIT 1;
    SELECT id INTO conductor2_id FROM conductores WHERE nombre = 'María González' LIMIT 1;
    
    -- Insertar viajes
    INSERT INTO viajes (id_viaje, cliente, ruta, fecha, hora, conductor_id, conductor_nombre, tracto_patente, rampla_codigo, estado, horas_estimadas) VALUES
    ('V001', 'FALABELLA', 'Santiago-Valparaíso', '2025-01-25', '08:00', conductor1_id, 'Juan Pérez', 'AB-1234', 'R001', 'agendado', 6),
    ('V002', 'CODELCO', 'Santiago-Antofagasta', '2025-01-24', '14:00', conductor2_id, 'María González', 'CD-5678', 'R002', 'en-curso', 16);
END $$;

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_conductores_estado ON conductores(estado);
CREATE INDEX idx_conductores_turno ON conductores(turno);
CREATE INDEX idx_tractos_estado ON tractos(estado);
CREATE INDEX idx_tractos_patente ON tractos(patente);
CREATE INDEX idx_ramplas_estado ON ramplas(estado);
CREATE INDEX idx_ramplas_codigo ON ramplas(codigo);
CREATE INDEX idx_viajes_estado ON viajes(estado);
CREATE INDEX idx_viajes_fecha ON viajes(fecha);
CREATE INDEX idx_viajes_cliente ON viajes(cliente);
CREATE INDEX idx_viajes_conductor_id ON viajes(conductor_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_conductores_updated_at BEFORE UPDATE ON conductores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tractos_updated_at BEFORE UPDATE ON tractos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ramplas_updated_at BEFORE UPDATE ON ramplas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viajes_updated_at BEFORE UPDATE ON viajes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ramplas ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (permitir todas las operaciones por ahora)
-- En producción, estas políticas deberían ser más restrictivas
CREATE POLICY "Enable all operations for conductores" ON conductores FOR ALL USING (true);
CREATE POLICY "Enable all operations for tractos" ON tractos FOR ALL USING (true);
CREATE POLICY "Enable all operations for ramplas" ON ramplas FOR ALL USING (true);
CREATE POLICY "Enable all operations for viajes" ON viajes FOR ALL USING (true);

-- Crear vistas útiles para reportes
CREATE VIEW vista_conductores_disponibles AS
SELECT 
    id,
    nombre,
    licencia,
    turno,
    horas_disponibles,
    horas_usadas_mes,
    (180 - horas_usadas_mes) as horas_restantes_mes,
    ROUND((horas_usadas_mes::decimal / 180) * 100, 2) as porcentaje_horas_usadas
FROM conductores 
WHERE estado = 'disponible' 
  AND horas_disponibles > 0 
  AND horas_usadas_mes < 180;

CREATE VIEW vista_recursos_disponibles AS
SELECT 
    'conductor' as tipo_recurso,
    COUNT(*) as cantidad_disponible
FROM conductores 
WHERE estado = 'disponible' AND horas_disponibles > 0 AND horas_usadas_mes < 180
UNION ALL
SELECT 
    'tracto' as tipo_recurso,
    COUNT(*) as cantidad_disponible
FROM tractos 
WHERE estado = 'disponible'
UNION ALL
SELECT 
    'rampla' as tipo_recurso,
    COUNT(*) as cantidad_disponible
FROM ramplas 
WHERE estado = 'disponible';

CREATE VIEW vista_viajes_hoy AS
SELECT 
    v.*,
    c.turno as conductor_turno,
    c.horas_disponibles as conductor_horas_disponibles
FROM viajes v
LEFT JOIN conductores c ON v.conductor_id = c.id
WHERE v.fecha = CURRENT_DATE
ORDER BY v.hora;

-- Comentarios para documentación
COMMENT ON TABLE conductores IS 'Tabla de conductores del sistema Nazar';
COMMENT ON TABLE tractos IS 'Tabla de vehículos tractores';
COMMENT ON TABLE ramplas IS 'Tabla de remolques/ramplas';
COMMENT ON TABLE viajes IS 'Tabla de viajes agendados y ejecutados';

COMMENT ON COLUMN conductores.horas_usadas_mes IS 'Horas trabajadas en el mes actual (máximo 180)';
COMMENT ON COLUMN conductores.horas_disponibles IS 'Horas disponibles para trabajar hoy';
COMMENT ON COLUMN viajes.horas_estimadas IS 'Duración estimada del viaje en horas';

-- Mostrar resumen de datos insertados
SELECT 'Conductores' as tabla, COUNT(*) as registros FROM conductores
UNION ALL
SELECT 'Tractos' as tabla, COUNT(*) as registros FROM tractos
UNION ALL
SELECT 'Ramplas' as tabla, COUNT(*) as registros FROM ramplas
UNION ALL
SELECT 'Viajes' as tabla, COUNT(*) as registros FROM viajes;
