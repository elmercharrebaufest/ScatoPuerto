CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosUltimaActualizacion]
(
	[Id]                INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCarga_Id]  INT NOT NULL,
	[Carga_id]          INT NOT NULL,
    [Fecha]				datetime,
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosUltimaActualizacion] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosUltimaActualizacion_dbo.ModuloDeCargaPlanilla_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade,

);