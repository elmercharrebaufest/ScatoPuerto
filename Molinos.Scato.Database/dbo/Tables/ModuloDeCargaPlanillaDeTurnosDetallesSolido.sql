CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosDetallesSolido]
(
	[Id]                                        INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCargaPlanillaDeTurnos_Id]    INT NOT NULL,
    [Exportador_Id]                             INT NOT NULL,
    [Linea_Id]                                     INT NOT NULL,
    [BodegaParcel]                              INT,
    [MaterialPuerto_Id]                         INT NOT NULL,
    [Destino_Id]                                INT NOT NULL,
    [Cantidad]                                  DECIMAL(18, 8),
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolido] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolido_dbo.ModuloDeCargaPlanillaDeTurnos_MDCPlanillaDeTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnos] ([Id]) on delete cascade,
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolido_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolido_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosDetallesSolido_dbo.Destino_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id])
);