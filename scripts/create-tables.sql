-- Crear tabla de conductores
CREATE TABLE IF NOT EXISTS conductores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    licencia VARCHAR(50) NOT NULL,
    turno VARCHAR(50) NOT NULL,
    horas_disponibles INTEGER DEFAULT 8,
    horas_usadas_mes INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupado', 'mantenimiento')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de tractos
CREATE TABLE IF NOT EXISTS tractos (
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
CREATE TABLE IF NOT EXISTS ramplas (
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
CREATE TABLE IF NOT EXISTS viajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_viaje VARCHAR(20) UNIQUE NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    ruta VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    conductor_id UUID REFERENCES conductores(id),
    conductor_nombre VARCHAR(255) NOT NULL,
    tracto_patente VARCHAR(20) NOT NULL,
    rampla_codigo VARCHAR(20) NOT NULL,
    estado VARCHAR(20) DEFAULT 'agendado' CHECK (estado IN ('agendado', 'en-curso', 'completado')),
    horas_estimadas INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos de ejemplo para conductores
INSERT INTO conductores (nombre, licencia, turno, horas_disponibles, horas_usadas_mes, estado) VALUES
('Juan Pérez', 'A3-A4', 'Mañana', 8, 120, 'disponible'),
('María González', 'A3-A4', 'Tarde', 0, 160, 'ocupado'),
('Carlos Rodríguez', 'A3-A4', 'Noche', 6, 90, 'mantenimiento'),
('Ana López', 'A3-A4', 'Mañana', 8, 45, 'disponible')
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para tractos
INSERT INTO tractos (patente, modelo, año, color, acreditaciones, estado) VALUES
('AB-1234', 'Volvo FH', '2020', 'Blanco', 'Puerto, Zona Franca', 'disponible'),
('CD-5678', 'Scania R450', '2019', 'Azul', 'General', 'ocupado'),
('EF-9012', 'Mercedes Actros', '2021', 'Blanco', 'Puerto', 'mantenimiento')
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para ramplas
INSERT INTO ramplas (codigo, tipo, capacidad, rev_tecnica, estado) VALUES
('R001', 'Rampla Seca', '25 ton', '2025-12-15', 'disponible'),
('R002', 'Multitemperatura', '20 ton', '2025-11-20', 'ocupado'),
('R003', 'Cisterna', '30 ton', '2025-08-10', 'mantenimiento')
ON CONFLICT DO NOTHING;

-- Insertar datos de ejemplo para viajes
INSERT INTO viajes (id_viaje, cliente, ruta, fecha, hora, conductor_nombre, tracto_patente, rampla_codigo, estado, horas_estimadas) VALUES
('V001', 'FALABELLA', 'Santiago-Valparaíso', '2025-07-02', '08:00', 'Juan Pérez', 'AB-1234', 'R001', 'agendado', 6),
('V002', 'CODELCO', 'Santiago-Antofagasta', '2025-07-01', '14:00', 'María González', 'CD-5678', 'R002', 'en-curso', 16)
ON CONFLICT DO NOTHING;

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_conductores_estado ON conductores(estado);
CREATE INDEX IF NOT EXISTS idx_tractos_estado ON tractos(estado);
CREATE INDEX IF NOT EXISTS idx_ramplas_estado ON ramplas(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON viajes(estado);
CREATE INDEX IF NOT EXISTS idx_viajes_fecha ON viajes(fecha);

-- Habilitar Row Level Security (RLS)
ALTER TABLE conductores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tractos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ramplas ENABLE ROW LEVEL SECURITY;
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas (permitir todo por ahora)
CREATE POLICY "Enable all operations for conductores" ON conductores FOR ALL USING (true);
CREATE POLICY "Enable all operations for tractos" ON tractos FOR ALL USING (true);
CREATE POLICY "Enable all operations for ramplas" ON ramplas FOR ALL USING (true);
CREATE POLICY "Enable all operations for viajes" ON viajes FOR ALL USING (true);
