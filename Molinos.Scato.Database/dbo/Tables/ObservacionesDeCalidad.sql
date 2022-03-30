CREATE TABLE [dbo].[ObservacionesDeCalidad]
(
	 [Id]     INT            IDENTITY (1, 1) NOT NULL PRIMARY KEY,
    [Fecha] DATETIME NULL, 
    [Hora] DATETIME NULL, 
    [Observaciones] NVARCHAR(200) NULL, 
    [ModuloDeCargaPlanillaDeTurnos_Id] INT NOT NULL
    CONSTRAINT [FK_dbo.ObservacionesDeCalidad_dbo.ModuloDeCargaPlanillaDeTurnos_Id] FOREIGN KEY ([ModuloDeCargaPlanillaDeTurnos_Id]) REFERENCES [dbo].[ModuloDeCargaPlanillaDeTurnos] ([Id]), 
    [ObservacionVisible] BIT NOT NULL
)