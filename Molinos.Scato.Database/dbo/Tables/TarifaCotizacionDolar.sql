-- Create TarifaCotizacionDolar table
CREATE TABLE TarifaCotizacionDolar (
    Id INT IDENTITY(1, 1) PRIMARY KEY,
    Periodo DATETIME NOT NULL,
    ValorDolar DECIMAL(10, 2) NOT NULL,
    FechaActualizacion DATETIME NOT NULL DEFAULT GETDATE(),
    UsuarioActualizacion NVARCHAR(255) NULL
);
GO

CREATE INDEX IX_TarifaCotizacionDolar_FechaActualizacion 
ON TarifaCotizacionDolar(FechaActualizacion DESC);
GO

ALTER TABLE TarifaCotizacionDolar
ADD CONSTRAINT CK_TarifaCotizacionDolar_ValorDolar 
CHECK (ValorDolar > 0);
GO