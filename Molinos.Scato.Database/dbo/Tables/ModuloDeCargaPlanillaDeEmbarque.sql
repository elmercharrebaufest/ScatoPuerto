CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeEmbarque]
(
	[Id]                        INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCarga_Id]          INT NOT NULL,
	[Exportador_Id]				INT NOT NULL,
	[BodegaParcel]				INT NOT NULL,
	[TanqueDeAbordo]			nvarchar(50),
	[Destino_Id]				INT NULL,
	[Tk]						nvarchar(10),
	[Tn]						int,
	[Cantidad]					int,
	[MaterialPuerto_Id]			INT NOT NULL,
	[FechaComienzoCarga]		datetime,
	[FechaFinalizacionCarga]	datetime,
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeEmbarque] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeEmbarque_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade,
	CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeEmbarque_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
	CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeEmbarque_dbo.Destino_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),
	CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeEmbarque_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id])
);