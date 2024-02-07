CREATE TABLE [dbo].[AfipSolicitudNoABordo]
(
	[Id] INT IDENTITY (1, 1) NOT NULL, 
    [IdentificadorSolicitud] NVARCHAR(50) NOT NULL,
    [AfipCoem_Id] INT NOT NULL,
    [AfipMotivoNoABordo_Id] INT NOT NULL, 
    [DescripcionMotivo] NVARCHAR(200) NOT NULL, 
    [Estado] INT NOT NULL, 
    [FechaCreacion] DATETIME NOT NULL, 
    [FechaActualizacion] DATETIME NOT NULL,
    CONSTRAINT [PK_AfipSolicitudNoABordo] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AfipSolicitudNoABordo_dbo.AfipCoem_Id] FOREIGN KEY ([AfipCoem_Id]) REFERENCES [AfipCoem]([Id]),
    CONSTRAINT [FK_dbo.AfipSolicitudNoABordo_dbo.AfipMotivoNoABordo_Id] FOREIGN KEY ([AfipMotivoNoABordo_Id]) REFERENCES [AfipMotivoNoABordo]([Id])
)
