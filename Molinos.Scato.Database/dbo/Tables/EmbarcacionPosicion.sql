CREATE TABLE [dbo].[EmbarcacionPosicion] (
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]         INT                 NOT NULL,
    [HoraUTCPosicionRecibida]    datetime     NOT NULL,
    [HoraLocalBarco]      datetime            NOT NULL,
    [Area]                NVARCHAR (40)       NULL,
    [PuertoActual]        NVARCHAR (50)       NULL,
    [Latitud]             NVARCHAR (50)       NULL,
	[Longitud]            NVARCHAR (50)       NULL,
    [Estado]              NVARCHAR (100)      NULL,
	[VelocidadCurso]      NVARCHAR (50)       NULL,
    [FechaRegistro      ] datetime            NULL,
    CONSTRAINT [PK_dbo.EmbarcacionViaje] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.EmbarcacionViaje_dbo.Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Embarque_Id])
);
GO
CREATE NONCLUSTERED INDEX [IX_EmbarcacionPosicion_Id]
    ON [dbo].[EmbarcacionPosicion]([Id] ASC);

