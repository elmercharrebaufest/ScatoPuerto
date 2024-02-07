CREATE TABLE [dbo].[AfipSolicitudNoABordoDeclaracion]
(
	[Id] INT IDENTITY (1, 1) NOT NULL,
    [AfipSolicitudNoABordo_Id] INT NOT NULL,
    [AfipCoemMercaderiaSuelta_Id] INT NOT NULL,
    CONSTRAINT [PK_AfipSolicitudNoABordoDeclaracion] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_dbo.AfipSolicitudNoABordoDeclaracion_dbo.AfipSolicitudNoABordo_Id] FOREIGN KEY ([AfipSolicitudNoABordo_Id]) REFERENCES [AfipSolicitudNoABordo]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_dbo.AfipSolicitudNoABordoDeclaracion_dbo.AfipCoemMercaderiaSuelta_Id] FOREIGN KEY ([AfipCoemMercaderiaSuelta_Id]) REFERENCES [AfipCoemMercaderiaSuelta]([Id]) ON DELETE CASCADE
)
