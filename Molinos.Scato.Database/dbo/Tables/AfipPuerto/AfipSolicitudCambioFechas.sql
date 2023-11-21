CREATE TABLE [dbo].[AfipSolicitudCambioFechas]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1, 1), 
    [AfipCaratula_Id] INT NOT NULL, 
    [FechaArribo] DATETIME NOT NULL, 
    [FechaZarpada] DATETIME NOT NULL, 
    [FechaCreacion] DATETIME NOT NULL, 
    [FechaActualizacion] DATETIME NOT NULL,
    [AfipMotivoSolicitudCambio_Id] INT NOT NULL,
    [MotivoSolicitudDetalle] NVARCHAR(200) NOT NULL,
    [Estado] INT NOT NULL

    CONSTRAINT [FK_dbo.AfipSolicitudCambioFechas_dbo.AfipCaratula_Id] FOREIGN KEY ([AfipCaratula_Id]) REFERENCES [AfipCaratula]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.AfipSolicitudCambioFechas_dbo.AfipMotivoSolicitudCambio_Id] FOREIGN KEY ([AfipMotivoSolicitudCambio_Id]) REFERENCES [AfipMotivoSolicitudCambio]([Id]) ON DELETE CASCADE
)
