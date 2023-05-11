CREATE TABLE [dbo].[AfipCaratula]
(
	[Id] NVARCHAR(16) NOT NULL PRIMARY KEY, 
    [CodigoAduana] NVARCHAR(30) NOT NULL, 
    [CodigoLugarOperativo] NVARCHAR(3) NOT NULL, 
    [FechaArribo] DATETIME NOT NULL, 
    [FechaZarpada] DATETIME NOT NULL, 
    [Via] NVARCHAR(1) NOT NULL, 
    [NombreMedioTransporte] NVARCHAR(100) NOT NULL, 
    [PuertoDestino] NVARCHAR(5) NOT NULL, 
    [NumeroViaje] NVARCHAR(16) NOT NULL
)
