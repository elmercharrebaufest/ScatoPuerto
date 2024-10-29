CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad]
(
	[Id] INT NOT NULL IDENTITY (1, 1),
	[ModuloDeCargaPlanillaDeTurnos_Id] INT,
	[MaterialPuerto_Id] INT,
	[TotalTurnoMaterial] INT,
	[KgGravedad] INT,
	CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad] PRIMARY KEY CLUSTERED ([Id] ASC),
	CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad_ModuloDeCargaPlanillaDeTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnos] ([Id]),
	CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad_MaterialPuerto_Id]  FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id])
)
