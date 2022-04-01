CREATE TABLE [dbo].[EmbarcacionViaje] (
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]         INT            NOT NULL,
	[PaisOrigen]          NVARCHAR (50)  NULL,
	[PuertoOrigen]        NVARCHAR (80)  NULL,
	[PaisDestino]         NVARCHAR (50)  NULL,
	[PuertoDestino]       NVARCHAR (80)  NULL,
    [ATD]                 NVARCHAR (50)  NULL,
    [ATA]                 NVARCHAR (50)  NULL,
    [ETA_Reportado]       NVARCHAR (40)  NULL,
    [Destino_Reportado]   NVARCHAR (80)  NULL,
    [Peso_Reportado]      NVARCHAR (50)  NULL,
    [VelocidadRecorrido]  INT            NULL,
    [FechaRegistro      ] datetime       NULL,
    CONSTRAINT [PK_dbo.EmbarcacionViaje] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.EmbarcacionViaje_dbo.Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Embarque_Id])
);

GO
CREATE NONCLUSTERED INDEX [IX_EmbarcacionViaje_Id]
    ON [dbo].[EmbarcacionViaje]([Id] ASC);
