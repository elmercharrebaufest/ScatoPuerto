CREATE TABLE [dbo].[ObservacionesDeCalidad]
(
	 [Id]     INT            IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    [FechaHoraObs] DATETIME NULL, 
    [Observaciones] NVARCHAR(200) NULL, 
    [ModuloDeCargaPlanillaDeTurnosTurnos_Id] INT NOT NULL
    CONSTRAINT [FK_dbo.ObservacionesDeCalidad_dbo.ModuloDeCargaPlanillaDeTurnosTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnosTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnosTurnos] ([Id]), 
    [ObservacionVisible] BIT NOT NULL
)