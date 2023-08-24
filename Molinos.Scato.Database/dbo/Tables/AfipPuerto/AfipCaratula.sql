CREATE TABLE [dbo].[AfipCaratula]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [IdentificadorCaratula] NVARCHAR(16) NOT NULL,
    [IdentificadorBuque] NVARCHAR(7) NOT NULL,
    [CodigoAduana] NVARCHAR(30) NOT NULL, 
    [CodigoLugarOperativo] NVARCHAR(5) NOT NULL, 
    [FechaArribo] DATETIME NOT NULL, 
    [FechaZarpada] DATETIME NOT NULL, 
    [Via] NVARCHAR(1) NOT NULL, 
    [NombreMedioTransporte] NVARCHAR(100) NOT NULL, 
    [PuertoDestino] NVARCHAR(5) NOT NULL, 
    [NumeroViaje] NVARCHAR(16) NULL, 
    [FechaRegistro] DATETIME NOT NULL,
    [Estado] NVARCHAR(50) NULL
    CONSTRAINT [PK_AfipCaratula] PRIMARY KEY ([Id]), 
)
