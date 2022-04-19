CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosCortes]
(
	[Id]                                        INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCargaPlanillaDeTurnos_Id]    INT NOT NULL,
    [MotivosDeCorte_Id]                         INT NOT NULL,
    [HoraInicio]                                NVARCHAR (8),
    [HoraFin]                                   NVARCHAR (8),
    [TiempoTotal]                               NVARCHAR (8),
    [Observaciones]                             NVARCHAR (500),
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosTurnosCortes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosTurnosCortes_dbo.ModuloDeCargaPlanillaDeTurnos_MDCPlanillaDeTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnos] ([Id]) on delete cascade,
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosTurnosCortes_dbo.MotivosDeCorte_MotivosDeCorte_Id] FOREIGN KEY ([MotivosDeCorte_Id]) REFERENCES [dbo].[MotivosDeCorte] ([Id])
);