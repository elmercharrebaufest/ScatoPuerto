CREATE TABLE [dbo].[EmbarqueInformacion]
(
	[Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]          INT            NOT NULL,
    [IMO]                 NVARCHAR (40)  NULL,  
    [MMSI]                NVARCHAR (40)  NULL,
    [Bandera_Id]             INT  NOT NULL,
    [Tonelaje]            INT            NULL,
    [TonelajePesoMuerto]  INT            NULL,
    [LargoxAnchoExtremo]  NVARCHAR (50)  NULL,
	[FotoEmbarque]        VARCHAR (max) NULL,
	[FechaRegistro]       datetime       NULL,
	 CONSTRAINT [FK_dbo.EmbarqueInformacion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
     CONSTRAINT [FK_dbo.EmbarqueInformacion_dbo.Embarque_Bandera_Id] FOREIGN KEY ([Bandera_Id]) REFERENCES [dbo].[bandera] ([Id]),
    CONSTRAINT [PK_dbo.EmbarqueInformacion] PRIMARY KEY ([Id] ASC)
)
