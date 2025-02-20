CREATE TABLE [dbo].[HorariosExportador]
(
    [Id] INT IDENTITY (1, 1) NOT NULL,
    [ModuloDeCarga_Id] INT NOT NULL,
    [Inicio] DATETIME NULL,
    [Fin] DATETIME NULL, 
    [MaterialPuerto_Id] INT NOT NULL,
    [Exportador_Id] INT NOT NULL, 
    [Destino_Id] INT NULL, 
    [BodegaParcel] INT NULL, 
    CONSTRAINT [PK_dbo.HorariosExportador] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_dbo.HorariosExportador_dbo.ModuloDeCarga_ModuloDeCarga_Id] FOREIGN KEY ([ModuloDeCarga_Id]) REFERENCES [dbo].[ModuloDeCarga] ([Id]),
    CONSTRAINT [FK_dbo.HorariosExportador_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
    CONSTRAINT [FK_dbo.HorariosExportador_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
    CONSTRAINT [FK_dbo.HorariosExportador_dbo.Destino_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),
)
