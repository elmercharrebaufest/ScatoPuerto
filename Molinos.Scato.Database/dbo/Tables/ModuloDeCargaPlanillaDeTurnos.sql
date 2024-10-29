CREATE TABLE [dbo].[ModuloDeCargaPlanillaDeTurnos]
(
	[Id]                                INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCarga_Id]  INT NOT NULL,
	[Fecha]				datetime,
    [TurnoPuerto_Id]                    INT NOT NULL,
    [Cerrado]                           BIT NOT NULL default 0,
    [Enviado]                           BIT NOT NULL default 0,
    [GuardadoPorTablerista]                           BIT NOT NULL default 0,
    [GuardadoPorRecibidor]                           BIT NOT NULL default 0,
    [EsLiquido]                         BIT NOT NULL default 1,
    [FechaCierreTurno] DATETIME NULL, 
    CONSTRAINT [PK_dbo.ModuloDeCargaPlanillaDeTurnos] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnos_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade,
    CONSTRAINT [FK_dbo.ModuloDeCargaPlanillaDeTurnos_dbo.TurnoPuerto_TurnoPuerto_Id] FOREIGN KEY ([TurnoPuerto_Id]) REFERENCES [dbo].[TurnoPuerto] ([Id]),
);
