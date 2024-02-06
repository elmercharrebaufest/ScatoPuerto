CREATE TABLE [dbo].[AfipSolicitudCierreCarga]
(
	[Id] INT NOT NULL IDENTITY(1,1),
    [AfipCaratula_Id] INT NOT NULL, 
    [IdentificadorCierre] NVARCHAR(50) NOT NULL,
    [FechaCreacion] DATETIME NOT NULL, 
    [FechaActualizacion] DATETIME NOT NULL, 
    [Estado] INT NOT NULL

	CONSTRAINT [Pk_AfipSolicitarCierreCarga] PRIMARY KEY ([Id])
)
