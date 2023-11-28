CREATE TABLE [dbo].[AfipSolicitudCambioBuque]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1, 1), 
    [AfipCaratula_Id] INT NOT NULL, 
    [IdentificadorBuque] NVARCHAR(7) NOT NULL,
    [NombreMedioTransporte] NVARCHAR(100) NOT NULL,
    [FechaCreacion] DATETIME NOT NULL, 
    [FechaActualizacion] DATETIME NOT NULL,
    [Estado] INT NOT NULL

    CONSTRAINT [FK_dbo.AfipSolicitudCambioBuque_dbo.AfipCaratula_Id] FOREIGN KEY ([AfipCaratula_Id]) REFERENCES [AfipCaratula]([Id]) ON DELETE CASCADE
)
