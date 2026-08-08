ALTER TABLE retenciones
ADD COLUMN unidad_judicial_destino_id UUID REFERENCES instituciones(id) ON DELETE SET NULL;

CREATE INDEX idx_retenciones_unidad_judicial ON retenciones(unidad_judicial_destino_id);
