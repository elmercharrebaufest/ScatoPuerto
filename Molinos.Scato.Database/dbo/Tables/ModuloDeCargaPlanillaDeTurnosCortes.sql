CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosCortes]
(
	[Id]                                        INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCargaPlanillaDeTurnos_Id]    INT NOT NULL,
    [MotivosDeCorte_Id]                         INT NULL,
    [HoraInicio]                                NVARCHAR (8),
    [HoraFin]                                   NVARCHAR (8),
    [TiempoTotal]                               NVARCHAR (8),
    [Observaciones]                             NVARCHAR (500),
    [idBalanzaCorte]                            INT NULL,
    [Cantidad]                                  INT NULL,
    [TipoLineaEmbarque_Id] INT NULL, 

    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosCortes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosCortes_dbo.ModuloDeCargaPlanillaDeTurnos_MDCPlanillaDeTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnos] ([Id]) on delete cascade,
   -- CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosCortes_dbo.MotivosDeCorte_MotivosDeCorte_Id] FOREIGN KEY ([MotivosDeCorte_Id]) REFERENCES [dbo].[MotivosDeCorte] ([Id])
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosCortes_dbo.MotivosDeCorte_MotivosDeCorte_Id] FOREIGN KEY ([MotivosDeCorte_Id]) REFERENCES [dbo].[MotivosFallasBalanza] ([Id]),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosCortes_dbo.TipoLineaEmbarque_TipoLineaEmbarque_Id] FOREIGN KEY ([TipoLineaEmbarque_Id]) REFERENCES [dbo].[TipoLineaEmbarque] ([Id])
);