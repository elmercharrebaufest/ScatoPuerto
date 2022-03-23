CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnosTurnos]
(
	[Id]                                INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCarga_Id]  INT NOT NULL,
	[Fecha]				datetime,
    [TurnoPuerto_Id]                    INT NOT NULL,
    [Cerrado]                           BIT NOT NULL default 0,
    [Enviado]                           BIT NOT NULL default 0,
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnosTurnos] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosTurnos_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade,
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnosTurnos_dbo.TurnoPuerto_TurnoPuerto_Id] FOREIGN KEY ([TurnoPuerto_Id]) REFERENCES [dbo].[TurnoPuerto] ([Id]),
);