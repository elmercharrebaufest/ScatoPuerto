CREATE TABLE [dbo].[BalanzasCortes]
(
	[Id]                    INT IDENTITY (1, 1) NOT NULL,
    NumeroBalanza           NVARCHAR(50) NOT NULL, 
    [ModuloDeCarga_Id]      INT NOT NULL,
    [MotivosFallasBalanza_Id]  INT NULL,
    [Observaciones]         VARCHAR(MAX) NULL,     
    [Fecha_Inicio]          DATETIME NOT NULL,
    [Fecha_Corte]          DATETIME NOT NULL,
    [Bodega_Id]   INT NULL,
    [Material_id]  INT NULL ,
    [Kg]          int default 0,
    [Tn]          int default 0,
    [cerrado]    BIT NOT NULL default 0,
    [CorteManual] BIT NOT NULL default 0,
	[Exportador_Id] INT NULL, 
    [Destino_Id] INT NULL, 
    [CargaNormal] BIT NULL, 
    CONSTRAINT [PK_BalanzasCortes] PRIMARY KEY ([Id]), 
    CONSTRAINT [FK_dbo.BalanzasCortes_dbo.ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]) on delete cascade


);



