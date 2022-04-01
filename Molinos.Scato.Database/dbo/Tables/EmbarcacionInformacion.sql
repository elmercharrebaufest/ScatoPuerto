CREATE TABLE [dbo].[EmbarcacionInformacion] (
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]         INT            NOT NULL,
    [IMO]                 NVARCHAR (40)  NULL,
    [Nombre]              NVARCHAR (100) NOT NULL,
    [TipoEmbarcacion]     NVARCHAR (50)  NULL,
    [MMSI]                NVARCHAR (40)  NULL,
    [Bandera]             NVARCHAR (80)  NULL,
    [Tonelaje]            INT            NULL,
    [TonelajePesoMuerto]  INT            NULL,
    [LargoxAnchoExtremo]  NVARCHAR (50)  NULL,
	[FotoEmbarque]        NVARCHAR (max) NULL,
	[FechaRegistro]       datetime       NULL,
	
    CONSTRAINT [PK_dbo.EmbarcacionInformacion] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.EmbarcacionInformacion_dbo.Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Embarque_Id])
);

GO
CREATE NONCLUSTERED INDEX [IX_EmbarcacionInformacion_Id]
    ON [dbo].[EmbarcacionInformacion]([Id] ASC);
