CREATE TABLE [dbo].[EmbarqueInformacionViaje]
(
	[Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]          INT            NOT NULL,
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
	[FechaRegistro]       datetime       NULL,
	CONSTRAINT [FK_dbo.EmbarqueInformacionViaje_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
       CONSTRAINT [PK_dbo.EmbarqueInformacionViaje] PRIMARY KEY ([Id] ASC)
)
